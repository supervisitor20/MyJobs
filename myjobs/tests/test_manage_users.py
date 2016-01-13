from django.core.urlresolvers import reverse
from django.conf import settings
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import (AppAccessFactory, RoleFactory, UserFactory,
                                    ActivityFactory)
from seo.tests.factories import CompanyFactory
from setup import MyJobsBase
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
        self.role = RoleFactory(company=self.company, name="Admin")
        self.otherRole = RoleFactory(company=self.company, name="OtherRole")
        self.user = UserFactory(roles=[self.role], is_staff=True)
        self.activities = [
            ActivityFactory(name=activity, app_access=self.app_access)
            for activity in [
                "read role", "create role", "update role", "delete role",
                "read activity", "read user", "create user", "update user",
                "delete user", ]]
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

        app_access = first_result['fields']['app_access']
        self.assertIsInstance(app_access, int)

    def test_create_role_require_post(self):
        """
        Tests creating a role
        Requires POST
        """
        response = self.client.get(reverse('api_create_role'))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

    def test_create_role_unique_role(self):
        """
        Tests creating a role
        Roles must have a unique name per company
        """
        expected_role_name = self.role.name

        response = self.client.post(reverse('api_create_role'),
                                    data={'role_name': expected_role_name})
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "Another role with this name already exists.")

    def test_create_role_require_activity(self):
        """
        Tests creating a role
        Roles must have at least one activity
        """
        data_to_post = {}
        data_to_post['role_name'] = "TEST ROLE"
        response = self.client.post(reverse('api_create_role'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "Each role must have at least one activity.")

    def test_create_role(self):
        """
        Tests creating a role
        """
        data_to_post = {}
        data_to_post['role_name'] = "TEST ROLE"
        data_to_post['assigned_activities[]'] = ['read role']
        response = self.client.post(reverse('api_create_role'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_edit_role_require_post(self):
        """
        Tests editing a role
        Requires POST
        """
        expected_role_pk = self.role.pk

        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        response = self.client.get(reverse('api_edit_role',
                                           args=[expected_role_pk]),
                                   data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

    def test_edit_role_require_activity(self):
        """
        Tests editing a role
        Requires at least one actvity
        """
        expected_role_pk = self.role.pk

        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        response = self.client.post(reverse('api_edit_role',
                                            args=[expected_role_pk]),
                                    data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "At least one activity must be assigned.")

    def test_edit_role(self):
        """
        Tests editing a role
        """
        expected_role_pk = self.role.pk

        data_to_post = {}
        data_to_post['role_name'] = "NEW ROLE NAME"
        data_to_post['assigned_activities[]'] = ['read role']
        response = self.client.post(reverse('api_edit_role',
                                            args=[expected_role_pk]),
                                    data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_delete_role_require_post(self):
        """
        Tests deleting a role
        Requires POST
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_delete_role',
                                           args=[expected_role_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "DELETE method required.")

    def test_delete_role_role_most_exist(self):
        """
        Tests deleting a role
        Role must exist
        """
        response = self.client.delete(reverse('api_delete_role',
                                              args=[100000]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")

    def test_delete_role(self):
        """
        Tests deleting a role
        """
        expected_role_pk = self.role.pk

        # Should be able to delete an existing role
        response = self.client.delete(reverse('api_delete_role',
                                              args=[expected_role_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_get_roles_contain_roles(self):
        """
        Tests that the Roles API returns the proper data in the
        proper form
        Contains role information
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_roles'))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        role_id = first_result['role']['id']
        self.assertIsInstance(role_id, int)

        role_name = first_result['role']['name']
        self.assertIsInstance(role_name, unicode)

    def test_get_roles_contain_activities(self):
        """
        Tests that the Roles API returns the proper data in the
        proper form
        Contains activities information
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_roles'))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        activities = first_result['activities']

        activities_available = json.loads(activities['available'])
        activity_available_name = activities_available[0]['fields']['name']
        self.assertIsInstance(activity_available_name, unicode)

        activities_assigned = json.loads(activities['assigned'])
        activity_assigned_name = activities_assigned[0]['fields']['name']
        self.assertIsInstance(activity_assigned_name, unicode)

    def test_get_roles_contain_users(self):
        """
        Tests that the Roles API returns the proper data in the
        proper form
        Contains users information
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_roles'))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

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

    def test_get_specific_role_contains_role(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        Contain role
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

    def test_get_specific_role_contains_activities(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        Contain activities
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_specific_role',
                                           args=[expected_role_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        activities = first_result['activities']

        activities_available = json.loads(activities['available'])
        activity_available_name = activities_available[0]['fields']['name']
        self.assertIsInstance(activity_available_name, unicode)

        activities_assigned = json.loads(activities['assigned'])
        activity_assigned_name = activities_assigned[0]['fields']['name']
        self.assertIsInstance(activity_assigned_name, unicode)

    def test_get_specific_role_activities_contain_app_access(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        Contain app_access
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_specific_role',
                                           args=[expected_role_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

        activities = first_result['activities']

        activities_available = json.loads(activities['available'])
        activity_available_app_access = activities_available[0]['fields']['app_access']
        self.assertIsInstance(activity_available_app_access, int)

        activities_assigned = json.loads(activities['assigned'])
        activities_assigned_app_access = activities_assigned[0]['fields']['app_access']
        self.assertIsInstance(activities_assigned_app_access, int)

    def test_get_specific_role_contains_users(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        Contain users
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_specific_role',
                                           args=[expected_role_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_role_pk)]

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
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_get_specific_user',
                                           args=[expected_user_pk]))
        output = json.loads(response.content)
        first_result = output[str(expected_user_pk)]

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
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_get_users'))
        output = json.loads(response.content)
        first_result = output[str(expected_user_pk)]

        status = first_result['status']
        self.assertIsInstance(status, bool)

        email = first_result['email']
        self.assertIsInstance(email, unicode)

        roles = json.loads(first_result['roles'])
        role_id = roles[0]['pk']
        self.assertIsInstance(role_id, int)

        role_name = roles[0]['fields']['name']
        self.assertIsInstance(role_name, unicode)

    def test_create_user_require_post(self):
        """
        Tests creating a user
        Require POST
        """
        response = self.client.get(reverse('api_create_user'))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

    def test_create_user_user_must_have_role(self):
        """
        Tests creating a user
        Users must be assigned to at least one role
        """
        data_to_post = {}
        data_to_post['user_email'] = "timothy@leary.com"
        response = self.client.post(reverse('api_create_user'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "Each user must be assigned to at least one role.")

    def test_create_user(self):
        """
        Tests creating a user
        """
        data_to_post = {}
        data_to_post['user_email'] = "timothy@leary.com"
        data_to_post['assigned_roles[]'] = [self.role.name]
        response = self.client.post(reverse('api_create_user'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")

    def test_delete_user_require_post(self):
        """
        Tests deleting a user
        Require DELETE
        """
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_delete_user',
                                           args=[expected_user_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "DELETE method required.")

    def test_delete_user(self):
        """
        Tests deleting a user
        """
        expected_user_pk = self.user.pk

        response = self.client.delete(reverse('api_delete_user',
                                              args=[expected_user_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")
        self.assertEqual(output["message"], "User deleted.")

    def test_edit_user_require_post(self):
        """
        Tests editing a user
        Require POST
        """
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_edit_user',
                                           args=[expected_user_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "POST method required.")

    def test_edit_user_user_must_exist(self):
        """
        Tests editing a user
        User must exist
        """
        expected_user_pk = self.user.pk

        response = self.client.post(reverse('api_edit_user',
                                            args=[expected_user_pk + 1]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"], "User does not exist.")

    def test_edit_user_user_must_have_role(self):
        """
        Tests editing a user
        User must have role
        """
        expected_user_pk = self.user.pk

        response = self.client.post(reverse('api_edit_user',
                                            args=[expected_user_pk]))
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")
        self.assertEqual(output["message"],
                         "A user must be assigned to at least one role.")

    def test_edit_user_one_user_per_company_must_be_admin(self):
        """
        Tests editing a user, every company must have one user assigned to admin
        Edit user
        """
        expected_user_pk = self.user.pk

        data_to_post = {}
        data_to_post['assigned_roles[]'] = [self.otherRole.name]
        response = self.client.post(reverse('api_edit_user',
                                            args=[expected_user_pk]),
                                    data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "false")

    def test_edit_user(self):
        """
        Tests editing a user
        Edit user
        """
        expected_user_pk = self.user.pk

        data_to_post = {}
        data_to_post['assigned_roles[]'] = [self.role.name, self.otherRole.name]
        response = self.client.post(reverse('api_edit_user',
                                            args=[expected_user_pk]),
                                    data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")
