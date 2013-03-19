from django.conf.urls.defaults import patterns, url, include
from django.contrib import admin
from django.http import HttpResponsePermanentRedirect

from myjobs.views import *

urlpatterns = patterns('MyJobs.myjobs.views',
    url(r'^$', 'home', name='home'),
    url(r'^about/$', About.as_view(), name='about'),
    url(r'^privacy/$', Privacy.as_view()),
    url(r'^account/$', 'view_account', name='view_account'),
    url(r'^account/delete$', 'delete_account', name='delete_account'),
    url(r'^account/disable$', 'disable_account', name='disable_account'),
    url(r'^edit/basic$', 'edit_basic', name='edit_basic'),
    url(r'^edit/password$', 'edit_password', name='edit_password'),
    url(r'^edit/delete$', 'edit_delete', name='edit_delete'),
    url(r'^error/$', 'error', name='error'),
)
