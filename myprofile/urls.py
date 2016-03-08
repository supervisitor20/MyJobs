from django.conf.urls import patterns, url
from django.views.generic import RedirectView

urlpatterns = patterns('myprofile.views',
    url(r'^$', RedirectView.as_view(url='/profile/view/')),
    url(r'^view$', 'edit_profile', name='view_profile'),
    url(r'^view/$', 'edit_profile', name='view_profile'),


    # url(r'^experiment$', 'experiment', name='experiment'),


    url(r'^edit/summary$', 'edit_summary', name='edit_summary'),


    url(r'^api$', 'handle_form', name='handle_form'),
    # url(r'^view/edit$', 'handle_form', name='handle_form'),
    # url(r'^view/edit$', 'edit_profile_unit', name='edit_profile_unit'),

    # url(r'^view/edit$', 'experiment', name='experiment'),



    # url(r'^api$', 'myprofile_api', name='myprofile_api'),
    # url(r'^api/$', 'myprofile_api', name='myprofile_api'),
    url(r'^view/delete$', 'delete_item', name='delete_item'),
    url(r'^view/details$', 'get_details', name='get_details'),
)
