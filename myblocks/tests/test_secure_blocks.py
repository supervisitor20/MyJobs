import json

from django.core.urlresolvers import reverse

from seo.tests.setup import DirectSEOBase

from seo.tests.factories import SeoSiteFactory


class TestSecureBlocks(DirectSEOBase):
    fixtures = ['login_page.json']

    def test_secure_blocks_empty(self):
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.make_sb_request('{"blocks": {}}')
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result)

    def test_secure_blocks_bad_parse(self):
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.make_sb_request('@@@@@@@@@')
        self.assertEqual(400, resp.status_code)

    def test_secure_blocks_render(self):
        SeoSiteFactory(domain='jobs.example.com')
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue('my-jobs-logo-1' in result)

    def make_sb_request(self, body):
        url = reverse('secure_blocks')
        return self.client.post(
            url, body,
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN='http://jobs.example.com',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
