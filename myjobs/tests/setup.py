from mock import patch
from seo_pysolr import Solr

from django.conf import settings
from django.core.cache import cache
from django.core.urlresolvers import clear_url_caches
from django.test import TestCase

from myjobs.tests.helpers import return_file


class MyJobsBase(TestCase):
    def setUp(self):
        setattr(settings, 'ROOT_URLCONF', 'myjobs_urls')
        cache.clear()
        clear_url_caches()
        self.ms_solr = Solr('http://127.0.0.1:8983/solr/seo')
        self.ms_solr.delete(q='*:*')
        setattr(settings, "PROJECT", 'myjobs')

        self.base_context_processors = settings.TEMPLATE_CONTEXT_PROCESSORS
        context_processors = self.base_context_processors + (
            'mymessages.context_processors.message_lists',
        )
        setattr(settings, 'TEMPLATE_CONTEXT_PROCESSORS', context_processors)
        setattr(settings, 'MEMOIZE', False)

        self.patcher = patch('urllib2.urlopen', return_file())
        self.mock_urlopen = self.patcher.start()

    def tearDown(self):
        self.ms_solr.delete(q='*:*')
        setattr(settings, 'TEMPLATE_CONTEXT_PROCESSORS',
                self.base_context_processors)

        try:
            self.patcher.stop()
        except RuntimeError:
            # patcher was stopped in a test
            pass
