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
from django.test.utils import override_settings

from myjobs.decorators import MissingActivity
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)
from mypartners.tests.test_views import TestClient
from seo.tests.factories import CompanyFactory


@override_settings(ROLES_ENABLED=True)
class TestViewLevelActivities(TestCase):
    """Test views wrapped with activities."""

    def setUp(self):
        self.app_access = AppAccessFactory()
        self.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in [
                "read partner", "read contact", "read communication record"]]

        self.company = CompanyFactory(app_access=[self.app_access])
        # this role will be populated by activities on a test-by-test basis
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role], is_staff=True)

        # login the user so that we don't read redirected to the login page
        self.client = TestClient(HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.client.login_user(self.user)

    def assertRequires(self, view_name, *activities, **kwargs):
        """
        Asserst that the given view is only accessible when a user has a role
        with the given activities.
        """

        url = reverse(view_name, kwargs=kwargs.get('kwargs'))
        method = kwargs.get("method", "get").lower()

        response = getattr(self.client, method)(path=url)
        self.assertEqual(type(response), MissingActivity)

        self.role.activities = [activity for activity in self.activities
                                if activity.name in activities]

        response = getattr(self.client, method)(path=url)
        self.assertNotEqual(type(response), MissingActivity)

        self.role.activities.clear()

    def test_overview(self):
        """
        /reports/view/overview requires "read partner", "read contact",
        "read communication record"
        """

        self.assertRequires(
            "overview",
            "read partner", "read contact", "read communication record")

    def test_report_archive(self):
        """
        /reports/view/archive requires "read partner", "read contact",
        "read communication record"
        """

        self.assertRequires(
            "report_archive",
            "read partner", "read contact", "read communication record")

    def test_view_records(self):
        """
        reports/ajax/:app/:model requires "read partner", "read contact",
        "read communication recor"
        """

        self.assertRequires(
            "view_records", "read partner", "read contact",
            "read communication record", kwargs={
                'app': 'mypartners', 'model': 'contactrecord'
            })

    def test_reports(self):
        """
        /reports/view/:app/:model requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "reports",
            "read partner", "read contact", "read communication record",
            method="GET", kwargs={
                'app': 'mypartners', 'model': 'contactrecord'})

        self.assertRequires(
            "reports",
            "read partner", "read contact", "read communication record",
            method="POST", kwargs={
                'app': 'mypartners', 'model': 'contactrecord'})

    def test_regenerate(self):
        """
        /reports/ajax/regerate requres "read partner", "read contact",
        "read communication record"
        """

        self.assertRequires(
            "regenerate",
            "read partner", "read contact", "read communication record")

    def test_download_dynamic_report(self):
        """
        /reports/view/dynamicdownload requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "download_dynamic_report",
            "read partner", "read contact", "read communication record")

    def test_downloads(self):
        """
        /reports/view/downloads requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "downloads",
            "read partner", "read contact", "read communication record")

    def test_dynamicoverview(self):
        """
        /reports/view/dynamicoverview requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "dynamicoverview",
            "read partner", "read contact", "read communication record")

    def test_reporting_types_api(self):
        """
        /reports/api/reporting_types requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "reporting_types_api",
            "read partner", "read contact", "read communication record")

    def test_report_types_api(self):
        """
        /reports/api/report_types requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "report_types_api",
            "read partner", "read contact", "read communication record")

    def test_data_types_api(self):
        """
        /reports/api/data_types requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "data_types_api",
            "read partner", "read contact", "read communication record")

    def test_presentation_types_api(self):
        """
        /reports/api/presentations requires "read partner", "read contact",
        and "read communication record"
        """

        self.assertRequires(
            "presentation_types_api",
            "read partner", "read contact", "read communication record")

    def test_run_dynmaic_report(self):
        """
        /reports/api/run_report requires "read contact", "read partner",
        and "read communication record"
        """

        self.assertRequires(
            "run_dynamic_report",
            "read partner", "read contact", "read communication record")
