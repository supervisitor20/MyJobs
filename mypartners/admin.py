from django.contrib import admin

from django_extensions.admin import ForeignKeyAutocompleteAdmin

from mypartners.models import (Partner, Contact, CommonEmailDomain,
                               OutreachEmailDomain, OutreachEmailAddress,
                               PartnerLibrarySource)


def format_company_name(company):
    """
    Returns a string ot be used next to each company that displays how many
    admins belong to that company, or a warning if there aren't any.

    """
    template = "{name} ({count} users){warning}"
    count = company.admins.count()
    warning = "" if count else " **Might be a duplicate**"

    return template.format(name=company.name, count=count, warning=warning)


class OutreachEmailDomainAdmin(ForeignKeyAutocompleteAdmin):
    related_search_fields = {
        'company': ('name',)
    }

    related_string_functions = {
        'company': format_company_name
    }

    search_fields = ['company__name', 'domain']

    class Meta:
        model = OutreachEmailDomain

    class Media:
        js = ('django_extensions/js/jquery-1.7.2.min.js', )


class PartnerLibrarySourceAdmin(admin.ModelAdmin):
    def get_readonly_fields(self, request, obj=None):
        # developers can edit everything
        fields = []

        # staff can edit search_url and name
        if not request.user.email.endswith('apps.directemployers.org'):
            fields += ['download_url', 'params']

        # everyone else is restricted to read-only access
        if not request.user.email.endswith('directemployers.org'):
            fields += ['name', 'search_url', 'params']

        return fields


admin.site.register(Partner)
admin.site.register(Contact)
admin.site.register(CommonEmailDomain)
# TODO: Remove this once NUO Module is live
admin.site.register(OutreachEmailAddress)
admin.site.register(OutreachEmailDomain, OutreachEmailDomainAdmin)
admin.site.register(PartnerLibrarySource, PartnerLibrarySourceAdmin)
