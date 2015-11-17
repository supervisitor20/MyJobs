"""
These tests ensure that activity-level permissiosn are working properly.

Unlike the `myreports.tests.test_views` module, this one is not concerned with
ensuring that views are behaving correctly in the general sense, but rather
that functionality that should be guarded by certain activities are only
available when those activities are present for a user.

As such, these tests assume that the settings.ENABLE_ROLES is True.
"""

from django.core.urlresolvers import reverse
from django.test import TestCase
from mypartners.tests.test_views import TestClient
from mypartners.tests.test_activities import ActivityTestCase
from myjobs.tests.factories import *
from seo.tests.factories import *
from myjobs.decorators import MissingActivity


class TestViewLevelActivities(TestCase):
    """Test views wrapped with activities."""

    def setUp(self):
        self.app_access = AppAccessFactory()
        self.company = CompanyFactory(app_access=[self.app_access])
        # this role will be populated by activities on a test-by-test basis
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role])

        # login the user so that we don't get redirected to the login page
        self.client = TestClient(HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.client.login_user(self.user)

    def assertRequires(self, view_name, *activities, **kwargs):
        """
        Asserst that the given view is only accessible when a user has a role
        with the given activities.
        """

        url = reverse(view_name, kwargs=kwargs.get('kwargs'))

        response = self.client.get(path=url)
        self.assertEqual(type(response), MissingActivity)

        self.role.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in activities]

        response = self.client.get(path=url)
        self.assertNotEqual(type(response), MissingActivity)

    def test_overview(self):
        """
        /reports/view/overview requires "read partner", "read contact",
        "read communication record"
        """

        self.assertRequires(
            "overview", "read partner", "read contact",
            "read communication record")

    def test_report_archive(self):
        """
        /reports/view/archive requires "read partner", "read contact",
        "read communication record"
        """

        self.assertRequires(
            "report_archive", "read partner", "read contact",
            "read communication record")

    def test_view_records(self):
        """
        /ajax/:app/:model requires "read partner", "read contact",
        "read communication recor"
        """

        self.assertRequires(
            "view_records", "read partner", "read contact",
            "read communication record", kwargs={
                'app': 'mypartners', 'model': 'contactrecord'
            })
