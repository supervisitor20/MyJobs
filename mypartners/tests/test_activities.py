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
from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import AppAccessFactory, RoleFactory, UserFactory


@override_settings(ROLES_ENABLED=True, DEBUG=True)
class TestViewActivities(MyJobsBase):
    """Test views wrapped with activities."""

    def setUp(self):
        super(TestViewActivities, self).setUp()

        self.company = CompanyFactory()
        self.app_access = AppAccessFactory()
        # this role will be populated by activities on a test-by-test basis
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role])

        # login the user so that we don't get redirected to the login page
        self.client = TestClient()
        self.client.login_user(self.user)

    def test_prm(self):
        """
        Test that only users with the `view partner` activity may navigate
        to `/prm/view`.
        """
        with self.assertRaises(Http404):
            self.client.get(reverse("prm"))
