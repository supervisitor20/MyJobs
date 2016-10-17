from django.conf.urls import url, patterns

# API URLs
urlpatterns = patterns('analytics.api',
   url(r'^views-week', 'views_last_7_days', name='views_last_7_days'),
)