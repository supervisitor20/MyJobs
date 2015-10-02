import json

from django.core.urlresolvers import reverse

from myjobs.tests.setup import MyJobsBase


class TestChildDashboard(MyJobsBase):
    def test_secure_blocks(self):
        url = reverse('secure_blocks')
        resp = self.client.post(
            url, '{"blocks": {}}',
            HTTP_HOST='jobs.directemployers.org',
            HTTP_ORIGIN='http://jobs.directemployers.org',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest',
            content_type="application/json",
        )
        self.assertEqual(200, resp.status_code)
        result = json.loads(resp.content)
        self.assertEqual({}, result)
