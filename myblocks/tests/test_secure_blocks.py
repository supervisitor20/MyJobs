import json

from django.core.urlresolvers import reverse

from seo.tests.setup import DirectSEOBase

from seo.tests.factories import SeoSiteFactory


class TestSecureBlocks(DirectSEOBase):
    """
    Tests that the secure blocks api view in various circumstances.
    """
    fixtures = ['login_page.json']

    def setUp(self):
        super(TestSecureBlocks, self).setUp()
        SeoSiteFactory(domain='jobs.example.com')

    def test_secure_blocks_empty(self):
        """Browser asks for no blocks."""
        resp = self.make_sb_request('{"blocks": {}}')
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result, msg="secure block returned block when none was requested")

    def test_secure_blocks_bad_parse(self):
        """Handle unparseable JSON."""
        resp = self.make_sb_request('@@@@@@@@@')
        self.assertEqual(400, resp.status_code, msg="got %s! block request allowed unparseable json, check"
                                                    " secure block json parser" % resp.status_code)

    def test_secure_blocks_render(self):
        """Ask for a real block."""
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue('my-jobs-logo-1' in result, msg="block request not found in response. check fixture, "
                                                        "secure blocks logic")

    def test_secure_blocks_bad_origin(self):
        """Check that secure blocks do not load from invalid origins"""
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body, http_origin='http://notparent.com/')
        self.assertEqual(resp.status_code, 404, msg="got %s! secure block call responded despite bad origin."
                                                    " check cross site verify logic" % resp.status_code)

    def make_sb_request(self, body, http_origin='http://jobs.example.com'):
        """Encapsulate details of getting through CSRF protection, etc."""
        url = reverse('secure_blocks')
        return self.client.post(
            url, body,
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN=http_origin,
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
