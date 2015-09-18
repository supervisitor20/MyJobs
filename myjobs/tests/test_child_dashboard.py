import json

from django.core.urlresolvers import reverse

from myjobs.tests.setup import MyJobsBase


class TestChildDashboard(MyJobsBase):
    def test_child_dashboard(self):
        url = reverse('child_dashboard')
        url += "?referer=jobs.directemployers.org"
        resp = self.client.post(
            url, {},
            HTTP_HOST='jobs.directemployers.org',
            HTTP_ORIGIN='http://jobs.directemployers.org',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
        )
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertIn("start_here", result)
