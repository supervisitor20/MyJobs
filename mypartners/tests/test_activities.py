"""
These tests ensure that activity-level permissiosn are working properly.

Unlike the `myjobs.tests.test_views` module, this one is not concerned with
ensuring that views are behaving correctly in the general sense, but rather
that functionality that should be guarded by certain activities are only
available when those activities are present for a user.

As such, these tests assume that the settings.ENABLE_ROLES is True.
"""

from django.core.urlresolvers import reverse
from django.http import Http404
from django.test.utils import override_settings

from seo.tests.factories import CompanyFactory
from myjobs.decorators import MissingActivity
from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)


@override_settings(ROLES_ENABLED=True, DEBUG=True)
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
        response = self.client.get(reverse(view_name))
        self.assertEqual(type(response), MissingActivity)

        self.role.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in activities]

        response = self.client.get(reverse(view_name))
        self.assertEqual(response.status_code, 200)

    def test_prm(self):
        """
        Only users with the `read partner` activity may navigate to
        `/prm/view`.
        """

        self.assertRequires("prm", "read partner")

    def test_partner_library(self):
        """
        Only users with the `create partner` activity may navigate to
        `/prm/view/partner-library'.
        """

        self.assertRequires("partner_library", "create partner")

