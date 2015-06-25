from django.core.management import call_command
from django.core.urlresolvers import clear_url_caches
from django.db import connections
from django.test import TestCase
from django.conf import settings

import redirect_settings
import secrets


class RedirectBase(TestCase):
    def setUp(self):
        super(RedirectBase, self).setUp()
        self._middleware_classes = settings.MIDDLEWARE_CLASSES
        self._default_solr = settings.SOLR.get('default', None)

        settings.ROOT_URLCONF = 'redirect_urls'
        settings.PROJECT = 'redirect'
        settings.EXCLUDED_VIEW_SOURCE_CACHE_KEY = redirect_settings.EXCLUDED_VIEW_SOURCE_CACHE_KEY
        settings.CUSTOM_EXCLUSION_CACHE_KEY = redirect_settings.CUSTOM_EXCLUSION_CACHE_KEY
        settings.MIDDLEWARE_CLASSES = redirect_settings.MIDDLEWARE_CLASSES
        settings.SOLR['default'] = 'http://127.0.0.1:8983/solr/seo/'
        settings.options = secrets.options
        settings.my_agent_auth = secrets.my_agent_auth
        clear_url_caches()

        call_command("loaddata",
                     "redirect/migrations/excluded_view_sources.json")

        default_backend, archive_backend = (
            settings.DATABASES['default']['ENGINE'].split('.')[-1],
            settings.DATABASES['archive']['ENGINE'].split('.')[-1],
        )
        for backend, db in [(default_backend, 'default'),
                            (archive_backend, 'archive')]:
            if backend == 'mysql':
                cursor = connections[db].cursor()
                cursor.execute('alter table redirect_redirect convert to '
                               'character set utf8 collate utf8_unicode_ci')
                cursor.execute('alter table redirect_redirectarchive '
                               'convert to character set utf8 collate '
                               'utf8_unicode_ci')

    def tearDown(self):
        super(RedirectBase, self).tearDown()
        settings.MIDDLEWARE_CLASSES = self._middleware_classes
        if self._default_solr:
            settings.SOLR['default'] = self._default_solr
