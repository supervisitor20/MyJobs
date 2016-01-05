import json

from django.core.urlresolvers import reverse
from django.conf import settings


from seo.tests.setup import DirectSEOBase
from seo.tests.factories import SeoSiteFactory, UserFactory
from myjobs.tests.test_views import TestClient


class TestSecureBlocks(DirectSEOBase):
    """
    Tests that the secure blocks api view in various circumstances.
    """
    fixtures = ['login_page.json']

    def setUp(self):
        super(TestSecureBlocks, self).setUp()
        self.staff_user = UserFactory(is_staff=True)
        self.client = TestClient()
        self.client.login_user(self.staff_user)
        SeoSiteFactory(domain='jobs.example.com')

    def test_secure_blocks_empty(self):
        """Browser asks for no blocks."""
        resp = self.make_sb_request('{"blocks": {}}')
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result,
                         msg="got %s! secure block returned block when none was"
                             " requested" % result)

    def test_secure_blocks_bad_parse(self):
        """Handle unparseable JSON."""
        resp = self.make_sb_request('@@@@@@@@@')
        self.assertEqual(400, resp.status_code,
                         msg="got %s! block request allowed unparseable json, check"
                             " secure block json parser" % resp.status_code)

    def test_secure_blocks_render(self):
        """Ask for a real block."""
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body)
        result = json.loads(resp.content)
        self.assertTrue('my-jobs-logo-1' in result,
                        msg="block request not found in response. check fixture, "
                            "secure blocks logic")

    def test_secure_blocks_bad_origin(self):
        """Check that secure blocks do not load from invalid origins"""
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body, http_origin='http://notparent.com/')
        self.assertEqual(resp.status_code, 404,
                         msg="got %s! secure block call responded despite bad origin."
                             " check cross site verify logic" % resp.status_code)

    def test_secure_blocks_hiding_properly(self):
        """
        TEMP TEST. Ensure that secure blocks does not return anything when non staff
        user attempts to access the API. Remove when secure blocks is released

        :return:
        """
        nonstaff_user = UserFactory(is_staff=False, email="mrT@test.com")
        self.client.login_user(nonstaff_user)
        body = '{"blocks": {"my-jobs-logo-1": {}}}'
        resp = self.make_sb_request(body)
        self.assertEqual(resp.status_code, 404,
                         msg="Expected 404 got %s! Non staff user was able to "
                             "access API while secure blocks disabled for"
                             " nonstaff" % resp.status_code)

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
