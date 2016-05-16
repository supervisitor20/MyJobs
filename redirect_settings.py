from datetime import timedelta

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

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'redirect.middleware.ExcludedViewSourceMiddleware',
    'redirect.middleware.MyJobsRedirectMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
)
