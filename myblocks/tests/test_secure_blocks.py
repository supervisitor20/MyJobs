import json

from django.core.urlresolvers import reverse

from seo.tests.setup import DirectSEOBase

from seo.tests.factories import SeoSiteFactory


class TestSecureBlocks(DirectSEOBase):
    def test_secure_blocks(self):
        url = reverse('secure_blocks')
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.client.post(
            url, '{"blocks": {}}',
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN='http://jobs.example.com',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result)

    def test_secure_blocks_bad_parse(self):
        url = reverse('secure_blocks')
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.client.post(
            url, '@@@@@@@@@',
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN='http://jobs.example.com',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
        self.assertEqual(400, resp.status_code)
