from django.contrib import admin

from django_extensions.admin import ForeignKeyAutocompleteAdmin

from mypartners.models import (Partner, Contact, CommonEmailDomain,
                               OutreachEmailDomain, OutreachEmailAddress)
from mydashboard.admin import company_user_name


class OutreachEmailDomainAdmin(ForeignKeyAutocompleteAdmin):
    related_search_fields = {
        'company': ('name',)
    }

    related_string_functions = {
        'company': company_user_name
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
