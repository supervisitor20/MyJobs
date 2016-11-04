import os
import sys

from django.core.management import call_command
from django.core.urlresolvers import clear_url_caches
from django.db import connections
from django.test import TransactionTestCase, override_settings
from django.conf import settings

import redirect_settings
import secrets


@override_settings(ROOT_URLCONF='redirect_urls', PROJECT='redirect',
                   MIDDLEWARE_CLASSES=redirect_settings.MIDDLEWARE_CLASSES,
                   options=secrets.options, my_agent_auth=secrets.my_agent_auth,
                   SOLR=settings.SOLR)
class RedirectBase(TransactionTestCase):

    fixtures = ['redirect/migrations/excluded_view_sources.json']

    def setUp(self):
        super(RedirectBase, self).setUp()
        self._default_solr = getattr(settings, 'SOLR', None)

        # Set some settings that don't get set when not using redirect
        # settings.
        self.base_context_processors = settings.TEMPLATES[0]['OPTIONS']['context_processors']
        settings.TEMPLATES[0]['OPTIONS']['context_processors'] = redirect_settings.TEMPLATE_CONTEXT_PROCESSORS
        settings.SOLR = {'default': settings.SOLR['seo_test']}
        clear_url_caches()


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
        settings.TEMPLATES[0]['OPTIONS']['context_processors'] = self.base_context_processors
        if self._default_solr:
            settings.SOLR = self._default_solr
