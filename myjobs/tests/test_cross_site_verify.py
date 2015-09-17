import re
import json

from django.http import HttpResponse
from django.conf.urls import url
import django.test
from django.test.utils import override_settings

from seo.tests.factories import SeoSiteFactory

import unittest

from seo.models import SeoSite
from myjobs.cross_site_verify import cross_site_verify, \
    verify_cross_site_request, DomainRelationshipException, \
    guess_child_domain, parse_request_meta, XRW


class TestRequestParsing(unittest.TestCase):
    def test_data(self):
        result = parse_request_meta({
            'REQUEST_METHOD': 'GET',
            'HTTP_HOST': 'aa.com',
            'HTTP_ORIGIN': 'http://bb.com',
            'HTTP_REFERER': 'http://cc.com/somewhere',
            'HTTP_X_REQUESTED_WITH': 'ddd',
            'QUERY_STRING': 'a=b&referer=aa.com&c=d',
        })
        expected = ('GET', 'bb.com', 'cc.com', 'aa.com', 'ddd')
        self.assertEqual(expected, result)

    def test_none(self):
        result = parse_request_meta({})
        self.assertEqual(('', None, None, None, None),
                         result)


class TestChildDomainGuessing(unittest.TestCase):
    def test_origin(self):
        self.assert_domain('aa.com', None, 'aa.com', None, None)

    def test_referer(self):
        self.assert_domain('aa.com', None, None, 'aa.com', None)

    def test_qsreferer(self):
        self.assert_domain('aa.com', 'aa.com', None, None, 'aa.com')

    def test_qsreferer_child(self):
        self.assert_error('qsreferer-not-host', 'z', None, None, 'aa.com')

    def test_qsreferer_host_none(self):
        self.assert_error('qsreferer-not-host', None, None, None, 'aa.com')

    def test_all_none(self):
        self.assert_error('no-child-info', None, None, None, None)

    def assert_domain(self, expected, host, origin, referer, qsreferer):
        try:
            self.assertEqual(
                expected,
                guess_child_domain(host, origin, referer, qsreferer))
        except DomainRelationshipException as e:
            message = ('Expected: %s, got error: %s for %r' % (
                       expected, e,
                       [host, origin, referer, qsreferer]))
            self.fail(message)

    def assert_error(self, expected, host, origin, referer, qsreferer):
        try:
            result = guess_child_domain(host, origin, referer, qsreferer)
            message = ('Expected error: %s, got: %s for %r' % (
                       expected, result,
                       [host, origin, referer, qsreferer]))
            self.fail(message)
        except DomainRelationshipException as e:
            assert(expected, e.message)


class MockSite(object):
    def __init__(self, id, domain, parent_site=None):
        self.id = id
        self.domain = domain,
        self.parent_site = parent_site


AA = MockSite('aa', 'aa.com')
AA2 = MockSite('aa2', 'teach.aa.com', AA)
BB = MockSite('bb', 'bb.com')


def mock_site_loader(site):
    return {
        AA.domain: AA,
        AA2.domain: AA2,
        BB.domain: BB,
    }.get(site)


class TestVerifyCrossSite(unittest.TestCase):
    def test_put(self):
        self.assert_failure(
            'method',
            'PUT',
            None,
            None,
            None,
            None,
            None)

    def test_bad_xrw(self):
        self.assert_failure(
            'bad-xrw',
            'POST',
            AA,
            AA.domain,
            None,
            "z" + XRW,
            None)

    def test_no_origin_is_parent(self):
        self.assert_success(
            'POST',
            AA,
            None,
            None,
            XRW,
            AA.domain)

    def test_no_origin_is_parent_qsreferer_mismatch(self):
        self.assert_failure(
            'qsreferer-not-host',
            'POST',
            AA,
            None,
            None,
            XRW,
            BB.domain)

    def test_get_origin_is_parent(self):
        self.assert_success(
            'POST',
            AA,
            AA.domain,
            None,
            XRW,
            None)

    def test_get_host_is_child(self):
        self.assert_failure(
            'host-not-parent',
            'POST',
            AA2,
            None,
            None,
            None,
            None)

    def test_origin_not_child_of_parent(self):
        self.assert_failure(
            'not-child-of-parent',
            'POST',
            BB,
            AA2.domain,
            None,
            XRW,
            None)

    def test_origin_is_child_of_parent_no_xrw(self):
        self.assert_failure(
            'bad-xrw',
            'POST',
            AA,
            AA2.domain,
            None,
            None,
            None)

    def test_origin_is_child_of_parent(self):
        self.assert_success(
            'POST',
            AA,
            AA2.domain,
            None,
            XRW,
            None)

    def test_get_referer_is_missing(self):
        self.assert_failure(
            'no-child-info',
            'GET',
            AA,
            None,
            None,
            None,
            None)

    def test_get_referer_is_missing_qsreferer_is_parent(self):
        self.assert_success(
            'GET',
            AA,
            None,
            None,
            None,
            AA.domain)

    def test_get_referer_is_missing_qsreferer_is_child(self):
        self.assert_failure(
            'qsreferer-not-host',
            'GET',
            AA,
            None,
            None,
            None,
            AA2.domain)

    def assert_success(self, method, host, origin, referer, xrw,
                       qsreferer):
        try:
            verify_cross_site_request(
                mock_site_loader,
                method,
                host,
                origin,
                referer,
                xrw,
                qsreferer)
        except DomainRelationshipException as e:
            message = ('Expected: ok, got error: %s for %r' % (
                       e,
                       [method, host, origin, referer,
                        xrw, qsreferer]))
            self.fail(message)

    def assert_failure(self, expected_fail, method, host,
                       origin, referer, xrw, qsreferer):
        try:
            verify_cross_site_request(
                mock_site_loader,
                method,
                host,
                origin,
                referer,
                xrw,
                qsreferer)
            message = ('Expected error: %s, got success for %r' % (
                       expected_fail,
                       [method, host, origin, referer,
                        xrw, qsreferer]))
            self.fail(message)
        except DomainRelationshipException as e:
            self.assertEqual(expected_fail, e.message)


@cross_site_verify
def ping(request):
    return HttpResponse("hello")


urlpatterns = [
    url(r'^ping/$', ping, name='ping'),
]


@override_settings(ROOT_URLCONF=__name__)
class TestVerifyCrossSiteIntegration(django.test.TestCase):
    def setUp(self):
        self.aa = SeoSiteFactory(domain='aa.com')
        self.aa2 = SeoSiteFactory(domain='teach.aa.com')
        self.bb = SeoSiteFactory(domain='bb.com')

    def test_get_from_parent(self):
        resp = self.client.get(
            "/ping/",
            HTTP_HOST="aa.com",
            HTTP_REFERER="http://aa.com",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertEqual(200, resp.status_code)

    def test_post_xhr_from_parent(self):
        resp = self.client.post(
            "/ping/", {},
            HTTP_HOST="aa.com",
            HTTP_ORIGIN="http://aa.com",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertEqual(200, resp.status_code)

    def test_get_qsreferer(self):
        resp = self.client.get(
            "/ping/?referer=aa.com",
            HTTP_HOST="aa.com")
        self.assertEqual(200, resp.status_code)

    def test_post_mismatched_child(self):
        resp = self.client.post(
            "/ping/", {},
            HTTP_HOST="aa.com",
            HTTP_ORIGIN="http://bb.com",
            HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertEqual(404, resp.status_code)
