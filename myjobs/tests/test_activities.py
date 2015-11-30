"""
These tests ensure that activity-level permissiosn are working properly.

Unlike the `myjobs.tests.test_views` module, this one is not concerned with
ensuring that views are behaving correctly in the general sense, but rather
that functionality that should be guarded by certain activities are only
available when those activities are present for a user.

As such, these tests assume that the settings.ENABLE_ROLES is True.
"""

from django.core.urlresolvers import reverse
from django.conf import settings

from myjobs.decorators import MissingActivity
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)
from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from seo.tests.factories import CompanyFactory


class TestViewLevelActivities(MyJobsBase):
    """Test views wrapped with activities."""

    def setUp(self):
        super(TestViewLevelActivities, self).setUp()
        settings.ROLES_ENABLED = True

        self.app_access = AppAccessFactory()
        self.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in [
                "read role", "create role", "update role", "delete role",
                "read activity"]]
        self.company = CompanyFactory(app_access=[self.app_access])
        # this role will be populated by activities on a test-by-test basis
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role], is_staff=True)

        # login the user so that we don't get redirected to the login page
        self.client = TestClient()
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

    def test_manage_users(self):
        """
        /manage-users requires "read role"
        """

        self.assertRequires('manage_users', 'read role')

    def test_api_get_roles(self):
        """
        /manage-users/api/roles requires 'read role'
        """
        self.assertRequires('manage_users', 'read role')

    def test_api_get_specific_role(self):
        """
        /manage-users/api/roles/:id requires 'get role'
        """

        self.assertRequires(
            'api_get_specific_role', 'read role', kwargs={'role_id': 1})

    def test_api_create_role(self):
        """
        /manage-users/api/roles/create requires 'create role'
        """

        self.assertRequires('api_create_role', 'create role')

    def test_api_edit_role(self):
        """
        /manage-users/api/roles/edit requires 'update role'
        """

        self.assertRequires(
            'api_edit_role', 'update role', kwargs={'role_id': 1})

    def test_api_delete_role(self):
        """
        /manage-users/api/roles/delete requires 'delete role'
        """

        self.assertRequires(
            'api_delete_role', 'delete role', kwargs={'role_id': 1})

    def test_api_get_activities(self):
        """
        /manage-users/api/activities requires 'read role'
        """

        self.assertRequires('api_get_activities', 'read role')
