"""
These tests ensure that activity-level permissiosn are working properly.

Unlike the `myjobs.tests.test_views` module, this one is not concerned with
ensuring that views are behaving correctly in the general sense, but rather
that functionality that should be guarded by certain activities are only
available when those activities are present for a user.

As such, these tests assume that the settings.ENABLE_ROLES is True.
"""

from urllib import urlencode

from django.core.urlresolvers import reverse
from django.test.utils import override_settings

from seo.tests.factories import CompanyFactory
from myjobs.decorators import MissingActivity
from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)
from mypartners.helpers import get_library_partners
from mypartners.models import PartnerLibrary


@override_settings(ROLES_ENABLED=True)
class TestViewActivities(MyJobsBase):
    """Test views wrapped with activities."""

    def setUp(self):
        super(TestViewActivities, self).setUp()

        self.app_access = AppAccessFactory()
        self.company = CompanyFactory(app_access=[self.app_access])
        # this role will be populated by activities on a test-by-test basis
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role])

        # login the user so that we don't get redirected to the login page
        self.client = TestClient()
        self.client.login_user(self.user)

    def assertRequires(self, view_name, *activities):
        """
        Asserst that the given view is only accessible when a user has a role
        with the given activities.
        """

        url = reverse(view_name)

        response = self.client.get(path=url)
        self.assertEqual(type(response), MissingActivity)

        self.role.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in activities]

        response = self.client.get(path=url)
        self.assertNotEqual(type(response), MissingActivity)

    def test_prm(self):
        """
        /prm/view requires "read partner".
        """

        self.assertRequires("prm", "read partner")

    def test_partner_library(self):
        """
        /prm/partner-library requires "create partner".
        """

        self.assertRequires("partner_library", "read partner")

    def test_create_partner_from_library(self):
        """
        /prm/view/partner-library/add requires "create partner".
        """

        self.assertRequires("create_partner_from_library", "create partner")

    def test_partner_overview(self):
        """
        /prm/view/overview requires "read partner".
        """

        self.assertRequires("partner_overview", "read partner")

    def test_partner_tagging(self):
        """
        /prm/view/tagging requires "create tag".
        """

        self.assertRequires("partner_tagging", "read tag")

    def test_edit_partner_tag(self):
        """
        /prm/view/tagging/edit requires "update tag".
        """

        self.assertRequires("edit_partner_tag", "update tag")

    def test_partner_details(self):
        """
        /prm/view/details requires "read partner"
        """

        self.assertRequires("partner_details", "update partner")

    def test_tag_color(self):
        """
        /prm/view/records/get-tag-color requires "read tag"
        """

        self.assertRequires("tag_color", "read tag")

    def test_tag_names(self):
        """
        /prm/view/records/get-tags requires "read tag"
        """

        self.assertRequires("tag_names", "read tag")

    def test_partner_get_records(self):
        """
        /prm/view/records/retrieve_records requires "read communication record"
        """

        self.assertRequires("partner_get_records", "read communication record")

    def test_report_view(self):
        """
        /prm/view/reports/details requires "read communication record"
        """

        self.assertRequires("report_view", "read communication record")

    def test_partner_records(self):
        """
        /prm/view/records requires "read communication record"
        """

        self.assertRequires("report_view", "read communication record")

    def test_partner_edit_record(self):
        """
        /prm/view/records/edit requires "create communication record" and
        "update communication record"
        """

        self.assertRequires(
            "partner_edit_record", "create communication record",
            "update communication record")

    def test_get_contact_information(self):
        """
        /prm/view/records/contact_info requires "read contact"
        """

        self.assertRequires("get_contact_information", "read contact")

    def test_record_view(self):
        """
        /prm/view/records/'details requires "read communication record"
        """

        self.assertRequires("record_view", "read communication record")

    def test_add_tags(self):
        """
        /prm/view/tagging/add requires "add tag"
        """

        self.assertRequires("add_tags", "create tag")

    def test_delete_partner_tag(self):
        """
        /prm/view/tagging/delete requires "delete tag"
        """

        self.assertRequires("delete_partner_tag", "delete tag")
