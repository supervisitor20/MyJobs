from django.conf.urls import url, patterns

# API URLs
urlpatterns = patterns('analytics.api',
   url(r'^views-by-date', 'views_by_date', name='views_by_date'),
)