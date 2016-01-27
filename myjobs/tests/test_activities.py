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
