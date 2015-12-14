from django.core.urlresolvers import reverse
# from django.core.urlresolvers import resolve,
from django.conf import settings
# from django.test.client import RequestFactory
# from tastypie.models import create_api_key
# from myjobs.models import User, Role, Activity
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)
from seo.tests.factories import CompanyFactory
# from myjobs.tests.test_views import TestClient
from setup import MyJobsBase
# from random import randint
# from myjobs.decorators import MissingActivity
import json

class ManageUsersTests(MyJobsBase):
    """
    Tests the manage users APIs, which is used to CRUD roles and users.
    """

    def setUp(self):
        super(ManageUsersTests, self).setUp()
        settings.ROLES_ENABLED = True

        self.app_access = AppAccessFactory()
        self.company = CompanyFactory(app_access=[self.app_access])
        self.role = RoleFactory(company=self.company)
        self.user = UserFactory(roles=[self.role], is_staff=True)
        self.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in [
                "read role", "create role", "update role", "delete role",
                "read activity", "read user", "create user", "update user",
                "delete user",]]
        self.role.activities = [activity for activity in self.activities]
        # login the user so that we don't get redirected to the login page
        self.client = TestClient()
        self.client.login_user(self.user)

    def test_activities(self):
        """
        Tests that the Activities API returns the proper data in the
        proper form
        """
        response = self.client.get(reverse('api_get_activities'))

        output = json.loads(response.content)
        first_result = output[0]

        name = first_result['fields']['name']
        self.assertIsInstance(name, unicode)

        description = first_result['fields']['description']
        self.assertIsInstance(description, unicode)

    def test_create_role(self):
        """
        Tests creating a role
        """

        expected_role_name = self.role.name

        # api_create_role requires POST
        response = self.client.get(reverse('api_create_role'))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

        # api_create_role requires a uniquely named role
        response = self.client.post(reverse('api_create_role'),
                                    data={'role_name': expected_role_name})
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "Another role with this name already exists.")

        # Roles must have at least one activity
        data_to_post = {}
        data_to_post['role_name'] = "TEST ROLE"
        response = self.client.post(reverse('api_create_role'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "Each role must have at least one activity.")

        # A role with a unique name an one activity should be created just fine
        data_to_post = {}
        data_to_post['role_name'] = "TEST ROLE"
        data_to_post['assigned_activities[]'] = ['read role']
        response = self.client.post(reverse('api_create_role'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_edit_role(self):
        """
        Tests editing a role
        """

        expected_role_pk = self.role.pk

        # api_create_role requires POST
        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        response = self.client.get(reverse('api_edit_role',
                                            args=[expected_role_pk]),
                                            data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

        # api_edit_role requires at least one activity
        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        response = self.client.post(reverse('api_edit_role',
                                            args=[expected_role_pk]),
                                            data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "At least one activity must be assigned.")

        # Should be able to edit a role
        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        data_to_post['assigned_activities[]'] = ['read role']
        response = self.client.post(reverse('api_edit_role',
                                            args=[expected_role_pk]),
                                            data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")





    def test_delete_role(self):
        """
        Tests deleting a role
        """

        expected_role_pk = self.role.pk

        # api_delete_role requires POST
        response = self.client.get(reverse('api_delete_role',
                                            args=[expected_role_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "DELETE method required.")

        # api_delete_role an arg of an existing role
        # Role 100000 doest not exist
        response = self.client.delete(reverse('api_delete_role',
                                            args=[100000]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")

        # Should be able to delete an existing role
        response = self.client.delete(reverse('api_delete_role',
                                            args=[expected_role_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_get_roles(self):
        """
        Tests that the Roles API returns the proper data in the
        proper form
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_roles'))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        role_id = first_result['role']['id']
        self.assertIsInstance(role_id, int)

        role_name = first_result['role']['name']
        self.assertIsInstance(role_name, unicode)

        activities = first_result['activities']

        activities_available = json.loads(activities['available'])
        activity_available_name = activities_available[0]['fields']['name']
        self.assertIsInstance(activity_available_name, unicode)

        activities_assigned = json.loads(activities['assigned'])
        activity_assigned_name = activities_assigned[0]['fields']['name']
        self.assertIsInstance(activity_assigned_name, unicode)

        users = first_result['users']

        users_available = json.loads(users['available'])
        users_available_id = users_available[0]['pk']
        self.assertIsInstance(users_available_id, int)
        users_available_email = users_available[0]['fields']['email']
        self.assertIsInstance(users_available_email, unicode)

        users_assigned = json.loads(users['assigned'])
        users_assigned_id = users_assigned[0]['pk']
        self.assertIsInstance(users_assigned_id, int)
        users_assigned_email = users_assigned[0]['fields']['email']
        self.assertIsInstance(users_assigned_email, unicode)

    def test_get_specific_role(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_specific_role',
                                           args=[expected_role_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        role_id = first_result['role']['id']
        self.assertIsInstance(role_id, int)

        role_name = first_result['role']['name']
        self.assertIsInstance(role_name, unicode)

        activities = first_result['activities']

        activities_available = json.loads(activities['available'])
        activity_available_name = activities_available[0]['fields']['name']
        self.assertIsInstance(activity_available_name, unicode)

        activities_assigned = json.loads(activities['assigned'])
        activity_assigned_name = activities_assigned[0]['fields']['name']
        self.assertIsInstance(activity_assigned_name, unicode)

        users = first_result['users']

        users_available = json.loads(users['available'])
        users_available_id = users_available[0]['pk']
        self.assertIsInstance(users_available_id, int)
        users_available_email = users_available[0]['fields']['email']
        self.assertIsInstance(users_available_email, unicode)

        users_assigned = json.loads(users['assigned'])
        users_assigned_id = users_assigned[0]['pk']
        self.assertIsInstance(users_assigned_id, int)
        users_assigned_email = users_assigned[0]['fields']['email']
        self.assertIsInstance(users_assigned_email, unicode)

    def test_get_specific_user(self):
        """
        Tests that the Users API returns the proper (specific user) data in the
        proper form
        """
        expected_role_pk = self.role.pk
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_get_specific_user',
                                           args=[expected_user_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        status = first_result['status']
        self.assertIsInstance(status, bool)

        email = first_result['email']
        self.assertIsInstance(email, unicode)

        roles_available = json.loads(first_result['roles']['available'])
        roles_available_id = roles_available[0]['pk']
        self.assertIsInstance(roles_available_id, int)

        roles_available_name = roles_available[0]['fields']['name']
        self.assertIsInstance(roles_available_name, unicode)

    def test_get_users(self):
        """
        Tests that the Users API returns the proper data in the proper form
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_users'))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        status = first_result['status']
        self.assertIsInstance(status, bool)

        email = first_result['email']
        self.assertIsInstance(email, unicode)

        roles = json.loads(first_result['roles'])
        role_id = roles[0]['pk']
        self.assertIsInstance(role_id, int)

        role_name = roles[0]['fields']['name']
        self.assertIsInstance(role_name, unicode)
