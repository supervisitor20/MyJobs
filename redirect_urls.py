from django.conf.urls import patterns, include, url
from django.contrib import admin

from postajob.views import SitePackageFilter
from seo.views.search_views import (BusinessUnitAdminFilter,
                                    SeoSiteAdminFilter)

# Uncomment the next two lines to enable the admin:
admin.autodiscover()

urlpatterns = patterns(
    '',
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^ajax/', include('automation.urls')),

    # Filtering URLs
    url(r'^sites/$',
        SitePackageFilter.as_view(),
        name='site_fsm'),
    url(r'^ajax/data/filter/business_units/$',
        BusinessUnitAdminFilter.as_view(),
        name='buid_admin_fsm'),
    url(r'^data/filter/sites/$', SeoSiteAdminFilter.as_view(),
        name='site_admin_fsm'),

    url(r'^accounts/', include('registration.urls')),
    url(r'^message/', include('mymessages.urls')),

    url('', include('redirect.urls')),
)

urlpatterns += patterns(
    'myjobs.views',
    url(r'^account/edit/$', 'edit_account', name='edit_account'),
    url(r'^account/delete$', 'delete_account', name='delete_account'),
    url(r'^account/disable$', 'disable_account', name='disable_account'),
)

handler404 = 'redirect.views.redirect_404'
handler500 = 'redirect.views.redirect_500'
