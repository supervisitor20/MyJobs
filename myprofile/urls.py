from django.conf.urls import patterns, url
from django.views.generic import RedirectView

urlpatterns = patterns(
    'myprofile.views',
    url(r'^$', RedirectView.as_view(url='/profile/view/')),
    url(r'^view$', 'edit_profile', name='view_profile'),
    url(r'^view/$', 'edit_profile', name='view_profile'),
    url(r'^view/delete$', 'delete_item', name='delete_item'),
    url(r'^view/edit$', 'handle_form', name='handle_form'),
    url(r'^edit/(?P<pk>\d+)/$', 'profile_unit_api'),
    url(r'^edit/(?P<module>[A-z]+)/$', 'profile_unit_api'),
    url(r'^create/(?P<module>[A-z]+)/$', 'profile_unit_api'),
)
