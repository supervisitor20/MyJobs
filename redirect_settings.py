from datetime import timedelta
from django.conf import global_settings

PROJECT = 'redirect'

SITE_ID = 1

COMPRESS_ENABLED = True

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

MIDDLEWARE_CLASSES = global_settings.MIDDLEWARE_CLASSES + (
    'redirect.middleware.ExcludedViewSourceMiddleware',
    'redirect.middleware.MyJobsRedirectMiddleware',
)
