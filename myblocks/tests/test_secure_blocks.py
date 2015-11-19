import json

from django.core.urlresolvers import reverse

from myblocks.models import Block, AllowedBlockPath, Path
from seo.tests.setup import DirectSEOBase
from seo.tests.factories import SeoSiteFactory


class TestSecureBlocks(DirectSEOBase):
    """
    Tests that the secure blocks api view in various circumstances.
    """
    fixtures = ['login_page.json']

    def setUp(self):
        super(TestSecureBlocks, self).setUp()
        self.site = SeoSiteFactory(domain='jobs.example.com')
        self.block = Block.objects.get(element_id='my-jobs-logo-1')
        self.default_url = reverse('secure_blocks')

    def make_allowed_paths(self, path=None):
        allowed_path = AllowedBlockPath.objects.create(block=self.block,
                                                       site=self.site)
        Path.objects.create(path=path or '/foo/', allowed_on=allowed_path)

    def make_sb_request(self, body):
        """Encapsulate details of getting through CSRF protection, etc."""
        return self.client.post(
            self.default_url, body,
            HTTP_HOST='jobs.example.com',
            HTTP_ORIGIN='http://jobs.example.com',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )

    def test_secure_blocks_empty(self):
        """Browser asks for no blocks."""
        resp = self.make_sb_request('{"blocks": {}}')
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result)

    def test_secure_blocks_bad_parse(self):
        """Handle unparseable JSON."""
        resp = self.make_sb_request('@@@@@@@@@')
        self.assertEqual(400, resp.status_code)

    def test_secure_blocks_render(self):
        """Ask for a real block. If no allowed paths are set, default to
        allow. This applies to blocks with and without entries in the
        AllowedBlockPath table."""
        # Without entry
        body = '{"blocks": {"%s": {}}}' % self.block.element_id
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue(result[self.block.element_id])

        # With entry
        self.make_allowed_paths()
        Path.objects.get().delete()
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue(result[self.block.element_id])

    def test_secure_blocks_bad_path(self):
        """If an allowed path is set and doesn't match the requested url,
        don't return block contents."""
        self.make_allowed_paths()
        resp = self.make_sb_request('{"blocks": {"%s": {}}}' %
                                    self.block.element_id)
        result = json.loads(resp.content)
        self.assertFalse(result[self.block.element_id])

    def test_secure_blocks_good_path(self):
        """If an allowed path is set that matches the requested url, return
        the requested block's contents."""
        self.make_allowed_paths(path=self.default_url)
        resp = self.make_sb_request('{"blocks": {"%s": {}}}' %
                                    self.block.element_id)
        result = json.loads(resp.content)
        self.assertTrue(result[self.block.element_id])
