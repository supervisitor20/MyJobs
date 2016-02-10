import datetime

import pytz

from django.contrib import admin
from django.contrib.sites.models import Site

from django_extensions.admin import ForeignKeyAutocompleteAdmin

from myjobs.models import (User, CustomHomepage, EmailLog, FAQ,
                           CompanyAccessRequest)
from myjobs.forms import (UserAdminForm,
                          CompanyAccessRequestApprovalForm)


class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['email', 'event', 'received', 'processed']
    search_fields = ['email']
    list_filter = ['event', 'processed']

    def get_readonly_fields(self, request, obj=None):
        # Disable editing of existing saved search logs while allowing logs
        # to be added
        if obj is None:
            return self.readonly_fields
        else:
            return ('email', 'event', 'received', 'processed', 'category',
                    'send_log', 'reason')


class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'date_joined', 'last_response', 'is_active',
                    'is_verified', 'deactivate_type', 'secondary_emails',
                    'source']
    search_fields = ['email', 'source', 'profileunits__secondaryemail__email']
    list_filter = ['is_active', 'is_verified', 'is_disabled', 'is_superuser',
                   'is_staff', 'deactivate_type']

    form = UserAdminForm
    readonly_fields = ('password', 'user_guid', 'last_response',
                       'source')
    exclude = ('profile_completion', )
    filter_horizontal = ['groups', 'user_permissions']
    fieldsets = [
        ('Password', {
            'fields': [
                ('password', 'password_change', ),
                ('new_password', )]}),
        ('Basic Information', {
            'fields': [
                ('email', 'gravatar', ),
                ('first_name', 'last_name', ),
                'user_guid', 'last_response', 'opt_in_employers',
                'opt_in_myjobs', ]}),
        ('Admin', {
            'fields': [
                ('user_permissions', 'groups', ),
                ('is_active', 'deactivate_type'),
                'is_verified', 'is_superuser', 'is_staff', 'is_disabled',
                'source', ]}),
    ]


class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'is_visible']
    search_fields = ['question', ]


def company_name(company):
    if company.admins.count() == 0:
        return "%s (%s users) **Might be a duplicate**" % (
            company.name, company.admins.count())
    else:
        return "%s (%s users)" % (company.name, company.admins.count())


class CompanyAccessRequestApprovalAdmin(ForeignKeyAutocompleteAdmin):

    form = CompanyAccessRequestApprovalForm

    def save_model(self, request, access_request, form, change):
        company = form.cleaned_data['company']

        access_request.authorized_by = request.user
        access_request.authorized_on = datetime.datetime.now(tz=pytz.UTC)

        access_request.requested_by.roles.add(
            company.role_set.get(name="Admin"))

        # make "Saved and Continue" act like "Save"
        request.POST.pop('_continue', None)
        access_request.save()

    def queryset(self, request):
        qs = super(CompanyAccessRequestApprovalAdmin, self).queryset(request)
        return qs.filter(authorized_on__isnull=True)

    def has_add_permission(self, request):
        return False


admin.site.register(User, UserAdmin)
admin.site.register(CustomHomepage)
admin.site.register(EmailLog, EmailLogAdmin)
admin.site.register(FAQ, FAQAdmin)
admin.site.register(CompanyAccessRequest, CompanyAccessRequestApprovalAdmin)
admin.site.unregister(Site)
