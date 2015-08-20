import re

from setup import MyJobsBase


class CorsTests(MyJobsBase):
    def setUp(self):
        super(CorsTests, self).setUp()
        self.resp = \
            self.client.options('/', secure=False,
                                HTTP_ORIGIN="http://zzz",
                                HTTP_ACCESS_CONTROL_REQUEST_METHOD='PUT',
                                HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type,',
                                HTTP_HOST='zzz')

    def test_origin(self):
        self.assertHeaderValue('http://zzz', 'Access-Control-Allow-Origin')

    def test_credentials(self):
        self.assertHeaderValue("true", "Access-Control-Allow-Credentials")

    def test_methods(self):
        self.assertAllIn(['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
                         "Access-Control-Allow-Methods")

    def test_allowed_headers(self):
        self.assertAllIn(['content-type'], "Access-Control-Allow-Headers")

    def assertHeaderValue(self, expected, header_name):
        self.assertIn(header_name, self.resp)
        header_value = self.resp[header_name]
        self.assertEqual(expected, header_value)

    def assertAllIn(self, expected_list, header_name):
        self.assertIn(header_name, self.resp)
        header_value = self.resp[header_name]
        header_split = re.split(r"[\s,]+", header_value)
        for expected in expected_list:
            self.assertIn(expected, header_split,
                          "should find %s in %s" % (expected, header_value))
