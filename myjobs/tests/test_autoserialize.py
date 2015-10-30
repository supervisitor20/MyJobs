import re
import json

from django.conf.urls import url
from django.test import TestCase
from django.test.utils import override_settings

from myjobs.autoserialize import autoserialize


@autoserialize
def ping(request):
    return {"pong": request.GET.get("param", "")}


urlpatterns = [
    url(r'^ping/$', ping, name='ping'),
]


@override_settings(ROOT_URLCONF=__name__)
class TestAutoserialize(TestCase):
    def test_json(self):
        resp = self.client.get("/ping/?param=hello")
        result = json.loads(resp.content)
        self.assertEqual({'pong': 'hello'}, result)
        self.assertEqual("application/json", resp['Content-Type'])

    def test_jsonp(self):
        resp = self.client.get("/ping/?"
                               "callback=zzz&param=hello")
        payload = self.assertCallbackMatch("zzz", resp.content)
        result = json.loads(payload)
        self.assertEqual({'pong': 'hello'}, result)
        self.assertEqual("text/javascript", resp['Content-Type'])

    def assertCallbackMatch(self, expected_callback, actual):
        pattern = r'^%s\((.*)\)$' % (re.escape(expected_callback))
        message = "expected '%s' to match '%s'" % (actual, pattern)

        match = re.match(pattern, actual)
        self.assertIsNotNone(match, message)

        return match.group(1)
