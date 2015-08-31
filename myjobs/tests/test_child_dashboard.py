import json

from django.core.urlresolvers import reverse

from myjobs.tests.setup import MyJobsBase


class TestChildDashboard(MyJobsBase):
    def test_child_dastboard(self):
        resp = self.client.get(reverse('child_dashboard'))
        result = json.loads(resp.content)
        self.assertIn("start_here", result)
