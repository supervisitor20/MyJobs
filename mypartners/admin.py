from django.contrib import admin

from mypartners.models import (Partner, Contact, CommonEmailDomain,
                               OutreachEmailDomain)


admin.site.register(Partner)
admin.site.register(Contact)
admin.site.register(CommonEmailDomain)
admin.site.register(OutreachEmailDomain)
