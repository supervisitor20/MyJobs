from django.conf.urls import patterns, url

from seo.views import settings_views

urlpatterns = patterns(
    '',

    # SeoSites Domain
    url(r'^site/domain',
        settings_views.EmailDomainFormView.as_view(),
        name='seosites_settings_email_domain_edit')
)
