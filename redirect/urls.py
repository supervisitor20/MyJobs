from django.conf.urls import patterns, url

urlpatterns = patterns(
    'redirect.views',

    # Redirect views
    url(r'^(?P<guid>[0-9A-Fa-f]{32})(?P<vsid>\d+)?(?P<debug>\+)?$', 'home',
        name='home'),

    # Email Redirect view
    url(r'^email$', 'email_redirect', name='email_redirect'),

    # View for updating buids
    url(r'^update_buid/$', 'update_buid', name='update_buid'),

    # Potential www.my.jobs redirect, catches root and anything not caught
    # previously
    url(r'^(?:.*/)?$', 'myjobs_redirect'),
)
