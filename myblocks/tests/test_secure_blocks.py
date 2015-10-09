import json

from django.core.urlresolvers import reverse

from seo.tests.setup import DirectSEOBase

from seo.tests.factories import SeoSiteFactory


class TestSecureBlocks(DirectSEOBase):
    """
    Tests that the secure blocks api view in various circumstances.
    """
    fixtures = ['login_page.json']

    def test_secure_blocks_empty(self):
        """Browser asks for no blocks."""
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.make_sb_request('{"blocks": {}}')
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result)

    def test_secure_blocks_bad_parse(self):
        """Handle unparseable JSON."""
        SeoSiteFactory(domain='jobs.example.com')
        resp = self.make_sb_request('@@@@@@@@@')
        self.assertEqual(400, resp.status_code)

    def test_secure_blocks_render(self):
        """Ask for a real block."""
        SeoSiteFactory(domain='jobs.example.com')
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue('my-jobs-logo-1' in result)

    def make_sb_request(self, body):
        """Encapsulate details of getting through CSRF protection, etc."""
        url = reverse('secure_blocks')
        return self.client.post(
            url, body,
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN='http://jobs.example.com',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
