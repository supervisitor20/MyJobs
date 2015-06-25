from django.core.management import call_command
from django.core.urlresolvers import clear_url_caches
from django.test import TransactionTestCase
from django.conf import settings

import redirect_settings
import secrets


class RedirectBase(TransactionTestCase):
    def setUp(self):
        super(RedirectBase, self).setUp()
        self._middleware_classes = settings.MIDDLEWARE_CLASSES
        self._default_solr = settings.SOLR.get('default', None)

        # Set some settings that don't get set when not using redirect
        # settings.
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

    def tearDown(self):
        super(RedirectBase, self).tearDown()
        settings.MIDDLEWARE_CLASSES = self._middleware_classes
        if self._default_solr:
            settings.SOLR['default'] = self._default_solr
