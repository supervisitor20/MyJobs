from django.core import mail
from django.core.urlresolvers import reverse
from myjobs.models import User
from myjobs.tests.factories import RoleFactory
from seo.tests.factories import CompanyFactory
from setup import MyJobsBase
import json


class ManageUsersTests(MyJobsBase):
    """
    Tests the manage users APIs, which is used to CRUD roles and users.
    """

    def setUp(self):
        super(ManageUsersTests, self).setUp()
        self.role.activities = self.activities
        self.otherCompany = CompanyFactory(app_access=[self.app_access])
        self.otherRole = RoleFactory(company=self.company, name="OtherRole")
        self.otherRoleAtOtherCompany = RoleFactory(
            company=self.otherCompany, name="otherRoleAtOtherCompany")
        self.user.roles.add(self.otherRole, self.otherRoleAtOtherCompany)

    def test_activities(self):
        """
        Tests that the Activities API returns the proper data in the
        proper form
        """
        response = self.client.get(reverse('api_get_activities'))

        output = json.loads(response.content)
        first_result = output[0]

        activity_name = first_result['activity_name']
        self.assertIsInstance(activity_name, unicode)

        app_access_name = first_result['app_access_name']
        self.assertIsInstance(app_access_name, unicode)

        activity_description = first_result['activity_description']
        self.assertIsInstance(activity_description, unicode)

        activity_id = first_result['activity_id']
        self.assertIsInstance(activity_id, int)

        app_access_id = first_result['app_access_id']
        self.assertIsInstance(app_access_id, int)

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
        first_result = output[0]

        role_id = first_result['role_id']
        self.assertIsInstance(role_id, int)

        role_name = first_result['role_name']
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
        first_result = output[0]

        activities = first_result['activities']
        first_activity = activities[0]

        activity_app_access = first_activity['app_access_name']
        self.assertIsInstance(activity_app_access, unicode)

        available_activities = first_activity['available_activities']
        available_activity_name = available_activities[0]['name']
        self.assertIsInstance(available_activity_name, unicode)
        available_activity_id = available_activities[0]['id']
        self.assertIsInstance(available_activity_id, int)

        assigned_activities = first_activity['assigned_activities']
        assigned_activity_name = assigned_activities[0]['name']
        self.assertIsInstance(assigned_activity_name, unicode)
        assigned_activity_id = assigned_activities[0]['id']
        self.assertIsInstance(available_activity_id, int)

    def test_get_roles_contain_users(self):
        """
        Tests that the Roles API returns the proper data in the
        proper form
        Contains users information
        """

        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_roles'))
        output = json.loads(response.content)
        first_result = output[0]

        assigned_users = first_result['assigned_users']
        first_assigned_user = assigned_users[0]
        first_assigned_user_id = first_assigned_user['id']
        self.assertIsInstance(first_assigned_user_id, int)
        first_assigned_user_name = first_assigned_user['name']
        self.assertIsInstance(first_assigned_user_name, unicode)

        available_users = first_result['available_users']
        first_available_user = available_users[0]
        first_available_user_id = first_available_user['id']
        self.assertIsInstance(first_available_user_id, int)
        first_available_user_name = first_available_user['name']
        self.assertIsInstance(first_available_user_name, unicode)

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

        role_id = output['role_id']
        self.assertIsInstance(role_id, int)

        role_name = output['role_name']
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
        activities = output['activities']
        first_activity = activities[0]

        activity_app_access = first_activity['app_access_name']
        self.assertIsInstance(activity_app_access, unicode)

        available_activities = first_activity['available_activities']
        available_activity_name = available_activities[0]['name']
        self.assertIsInstance(available_activity_name, unicode)
        available_activity_id = available_activities[0]['id']
        self.assertIsInstance(available_activity_id, int)

        assigned_activities = first_activity['assigned_activities']
        assigned_activity_name = assigned_activities[0]['name']
        self.assertIsInstance(assigned_activity_name, unicode)
        assigned_activity_id = assigned_activities[0]['id']
        self.assertIsInstance(available_activity_id, int)

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

        activities = output['activities']

        first_activity = activities[0]
        app_access_name = first_activity['app_access_name']
        self.assertIsInstance(app_access_name, unicode)

    def test_get_specific_role_contains_users(self):
        """
        Tests that the Roles API returns the proper (specific role) data in the
        proper form
        Contain users
        """
        expected_role_pk = self.role.pk

        response = self.client.get(reverse('api_get_specific_role',
                                           args=[expected_role_pk]))

        result = json.loads(response.content)

        assigned_users = result['assigned_users']
        first_assigned_user = assigned_users[0]
        first_assigned_user_id = first_assigned_user['id']
        self.assertIsInstance(first_assigned_user_id, int)
        first_assigned_user_name = first_assigned_user['name']
        self.assertIsInstance(first_assigned_user_name, unicode)

        available_users = result['available_users']
        first_available_user = available_users[0]
        first_available_user_id = first_available_user['id']
        self.assertIsInstance(first_available_user_id, int)
        first_available_user_name = first_available_user['name']
        self.assertIsInstance(first_available_user_name, unicode)

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

    def test_get_specific_user_with_unique_roles_list(self):
        """
        Given a user who has roles assigned through multiple companies, test
        that getting a specific user will return a unique list of roles (i.e.
        roles for that company)
        """
        expected_user_pk = self.user.pk

        # self.company is being used for self.client.get (not self.otherCompany)
        response = self.client.get(reverse('api_get_specific_user',
                                           args=[expected_user_pk]))

        output = json.loads(response.content)
        first_result = output[str(expected_user_pk)]
        roles_assigned = json.loads(first_result['roles']['assigned'])

        # This user is assigned to the following roles:
        #   role
        #   otherRole
        #   otherRoleAtOtherCompany
        # But role and otherRole are associated with the company self.client.get
        # uses to make the request. Therefore, the API should only return two
        # roles
        self.assertEqual(len(roles_assigned),2)

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

        lastInvitation = first_result['lastInvitation']
        self.assertIsInstance(lastInvitation, unicode)

        roles = json.loads(first_result['roles'])
        role_id = roles[0]['pk']
        self.assertIsInstance(role_id, int)

        role_name = roles[0]['fields']['name']
        self.assertIsInstance(role_name, unicode)

    def test_get_users_with_unique_roles_list(self):
        """
        Given a user who has roles assigned through multiple companies, test
        that getting a list of users will only return a unique list of roles
        (i.e. roles for the current company)
        """
        expected_user_pk = self.user.pk

        response = self.client.get(reverse('api_get_users'))
        output = json.loads(response.content)
        first_result = output[str(expected_user_pk)]

        roles = json.loads(first_result['roles'])

        # This user is assigned to the following roles:
        #   role
        #   otherRole
        #   otherRoleAtOtherCompany
        # But role and otherRole are associated with the company self.client.get
        # uses to make the request. Therefore, the API should only return two
        # roles
        self.assertEqual(len(roles),2)

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
        data_to_post['user_email'] = "andy@kaufman.com"
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
        data_to_post['user_email'] = "andy@kaufman.com"
        data_to_post['assigned_roles[]'] = [self.role.name]

        response = self.client.post(reverse('api_create_user'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")
        self.assertEqual(output["message"],
                         "User created. Invitation email sent.")

    def test_add_role_to_existing_user(self):
        """
        Tests adding a role to an existing user
        """
        data_to_post = {
            'user_email': self.user.email,
            'assigned_roles[]': [self.role.name]
        }

        response = self.client.post(reverse('api_create_user'), data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")
        self.assertEqual(output["message"],
                         "User already exists. Role invitation email sent.")

    def test_number_of_invitations_sent_on_role_addition(self):
        """
        Adding roles to a user should only send invitations for each of
        the new roles, not roles that were already attached.
        """
        new_role = RoleFactory(company=self.company)

        mail.outbox = []
        to_post = {
            'user_email': 'andy@kaufman.com',
            'assigned_roles[]': [self.role.name, new_role.name]
        }
        self.client.post(reverse('api_create_user'), to_post)
        message = "Expected {} invitations, found {}"
        self.assertEqual(len(mail.outbox), 2,
                         message.format(2, len(mail.outbox)))

        to_post['assigned_roles[]'].append(
            RoleFactory(company=self.company).name)
        self.client.post(reverse('api_create_user'), to_post)
        self.assertEqual(len(mail.outbox), 3,
                         message.format(3, len(mail.outbox)))

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
        data_to_post['assigned_roles[]'] = [self.role.name]

        response = self.client.post(reverse('api_edit_user',
                                            args=[expected_user_pk]),
                                    data_to_post)
        output = json.loads(response.content)
        self.assertEqual(output["success"], "true")
