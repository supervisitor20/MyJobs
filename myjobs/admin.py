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


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'description')
    fields = ('display_name', 'name', 'description')
    readonly_fields = ('name', 'description')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


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


class CompanyAccessRequestApprovalAdmin(ForeignKeyAutocompleteAdmin):
    """
    This admin page is used by staff to authorize access to a company.

    If submitted successfully, the user who submitted the request is assigned
    the "Admin" role for the company selected by the staff member filling out
    this form.

    """
    form = CompanyAccessRequestApprovalForm

    def save_model(self, request, access_request, form, change):
        # make "Saved and Continue" act like "Save"
        request.POST.pop('_continue', None)

        company = form.cleaned_data['company']

        # update access request
        access_request.authorized_by = request.user
        access_request.authorized_on = datetime.datetime.now(tz=pytz.UTC)
        access_request.save()

        # assign Admin role to requesting user
        access_request.requested_by.roles.add(
            company.role_set.get(name="Admin"))

    def queryset(self, request):
        qs = super(CompanyAccessRequestApprovalAdmin, self).queryset(request)
        # only show access requests which haven't already been authorized
        return qs.filter(authorized_on__isnull=True)

    def has_add_permission(self, request):
        """Hide the add button"""
        return False


admin.site.register(User, UserAdmin)
admin.site.register(CustomHomepage)
admin.site.register(EmailLog, EmailLogAdmin)
admin.site.register(FAQ, FAQAdmin)
admin.site.register(CompanyAccessRequest, CompanyAccessRequestApprovalAdmin)
admin.site.unregister(Site)
admin.site.register(Activity, ActivityAdmin)
