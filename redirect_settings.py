from datetime import timedelta
from default_settings import MIDDLEWARE_CLASSES

SITE_ID = 1

LANDING_DELAY = timedelta(minutes=30)

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = '/var/log/source_uploads/'

ROOT_URLCONF = 'redirect_urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'wsgi.application'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

EXCLUDED_VIEW_SOURCE_CACHE_KEY = 'excluded_view_sources'

CUSTOM_EXCLUSION_CACHE_KEY = 'custom_excluded_view_sources'

MIDDLEWARE_CLASSES += (
    'redirect.middleware.ExcludedViewSourceMiddleware',
    'redirect.middleware.MyJobsRedirectMiddleware',
)
