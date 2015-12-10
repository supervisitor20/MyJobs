from django.contrib import admin

from postajob.forms import (JobForm, JobLocationForm, ProductForm, ProductGroupingForm,
                            PurchasedProductForm, PurchasedJobAdminForm,
                            SitePackageForm)
from postajob.models import (Job, JobLocation, Product, ProductGrouping, PurchasedProduct,
                             PurchasedJob, SitePackage)


class ModelAdminWithRequest(admin.ModelAdmin):
    def get_form(self, request, obj=None, **kwargs):
        """
        Override get_form() to allow the request information to be
        passed along to the JobForm.

        """
        ModelForm = super(ModelAdminWithRequest, self).get_form(request, obj,
                                                                **kwargs)

        class ModelFormMetaClass(ModelForm):
            def __new__(cls, *args, **kwargs):
                kwargs['request'] = request
                return ModelForm(*args, **kwargs)
        return ModelFormMetaClass



class SitePackageAdmin(ModelAdminWithRequest):
    form = SitePackageForm
    list_display = ('id', 'name', )

    def queryset(self, request):
        """
        Make SeoSite-specific packages unavailable in the admin and prevent
        non-superusers from seeing packages.

        """
        packages = SitePackage.objects.user_available()
        if not request.user.is_superuser:
            packages = packages.filter(owner__admins=request.user)
        return packages


admin.site.register(SitePackage, SitePackageAdmin)
