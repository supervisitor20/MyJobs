from django.core.management import call_command
from django.core.urlresolvers import clear_url_caches
from django.test import TestCase
from django.conf import settings

import redirect_settings
import secrets


class RedirectBase(TestCase):
    def setUp(self):
        super(RedirectBase, self).setUp()
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
