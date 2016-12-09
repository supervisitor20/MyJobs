from django.conf import settings
from django.conf.urls import patterns, include, url

from postajob.views import SitePackageFilter
from seo.views.search_views import (BusinessUnitAdminFilter,
                                    SeoSiteAdminFilter)
from ajax_select import urls as ajax_select_urls

urlpatterns = patterns(
    '',
    url(r'^ajax_select/', include(ajax_select_urls)),

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

if settings.DEBUG and 'debug_toolbar' in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns += patterns(
        '',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )
