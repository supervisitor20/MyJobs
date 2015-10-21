from django.conf.urls import patterns, url
# from manage.views import ReportView

urlpatterns = patterns(
    'manage.views',
    url(r'^$', 'overview', name='overview'),

    url(r'^roles$', 'view_roles', name='role_list'),
    url(r'^roles/edit', 'edit_role', name='edit_role'),
    url(r'^roles/create$', 'edit_role', name='create_role'),

    url(r'^users$', 'view_users', name='view_users'),
    url(r'^users/edit', 'edit_user', name='edit_user'),
    url(r'^users/create$', 'edit_user', name='edit_user'),
)
