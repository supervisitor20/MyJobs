from django.contrib import admin

from django_extensions.admin import ForeignKeyAutocompleteAdmin

from mypartners.models import (Partner, Contact, CommonEmailDomain,
                               OutreachEmailDomain, OutreachEmailAddress)


def format_company_name(company):
    """
    Returns a string ot be used next to each company that displays how many
    admins belong to that company, or a warning if there aren't any.

    """
    template = "{name} ({count} users){warning}"
    count = company.company_user_count
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


admin.site.register(Partner)
admin.site.register(Contact)
admin.site.register(CommonEmailDomain)
# TODO: Remove this once NUO Module is live
admin.site.register(OutreachEmailAddress)
admin.site.register(OutreachEmailDomain, OutreachEmailDomainAdmin)
