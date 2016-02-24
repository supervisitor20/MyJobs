from django.contrib import admin

from ajax_select.helpers import make_ajax_form

from mypartners.models import (Partner, Contact, CommonEmailDomain,
                               OutreachEmailDomain, OutreachEmailAddress)


class OutreachEmailDomainAdmin(admin.ModelAdmin):
    form = make_ajax_form(OutreachEmailDomain, {'company': 'companies'})
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
