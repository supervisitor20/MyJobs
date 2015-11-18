from default_settings import *
from redirect_settings import *

from secrets import REDIRECT_PROD, ARCHIVE_PROD


DEBUG = False
TEMPLATE_DEBUG = DEBUG

ABSOLUTE_URL = 'https://secure.my.jobs/'

DATABASES = {
    'default': dict({
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'redirect',
        'HOST': 'db-redirect.c9shuxvtcmer.us-east-1.rds.amazonaws.com',
        'PORT': '3306',
    }, **REDIRECT_PROD),
    'archive': dict({
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'redirect',
        'HOST': 'db-redirectarchive.c9shuxvtcmer.us-east-1.rds.amazonaws.com',
        'PORT': '3306',
    }, **ARCHIVE_PROD)
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['localhost',
                 'jcnlx.com',
                 'jcnlx.org',
                 'my.jobs']

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': [
            'dseo-mc-cluster.qksjst.0003.use1.cache.amazonaws.com:11211',
            'dseo-mc-cluster.qksjst.0004.use1.cache.amazonaws.com:11211'
        ]
    }
}

# Uncomment for Django Debug Toolbar
MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',)
INSTALLED_APPS += ('debug_toolbar',)

NEW_RELIC_TRACKING = True

SOLR = {
    'default': 'http://solr_server:8983/solr/seo'
}
