from django.core.urlresolvers import reverse
from django.test.client import RequestFactory

from myblocks import helpers
from seo.tests.setup import DirectSEOBase


class HelpersTests(DirectSEOBase):
    def test_success_url(self):
        request = RequestFactory().get('/')
        self.assertEqual(helpers.success_url(request), reverse('home'))

        url = 'https://www.my.jobs/'
        request = RequestFactory().get('/', data={'next': url})
        self.assertEqual(helpers.success_url(request), url)
