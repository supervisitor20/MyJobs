from django.core.urlresolvers import resolve
from tastypie.models import create_api_key
from myjobs.models import User, Role, Activity
from myjobs.tests.factories import UserFactory
from seo.tests.factories import CompanyFactory
from django.test.client import RequestFactory
from myjobs.tests.test_views import TestClient
from setup import MyJobsBase
from random import randint

class ManageUsersTests(MyJobsBase):
    def setUp(self):
        super(ManageUsersTests, self).setUp()
        self.user = UserFactory()
        create_api_key(User, instance=self.user, created=True)
        self.client = TestClient(
            path='/api/v1/user/',
            data={'email': 'foo@example.com',
                  'username': self.user.email,
                  'api_key': self.user.api_key.key})

    def test_urls(self):
        # Confirm URL resolves to proper view
        resolver = resolve('/manage-users/')
        self.assertEqual(resolver.view_name, 'manage_users')
        resolver = resolve('/manage-users/api/roles/')
        self.assertEqual(resolver.view_name, 'api_get_roles')
        resolver = resolve('/manage-users/api/roles/99/')
        self.assertEqual(resolver.view_name, 'api_get_specific_role')
        resolver = resolve('/manage-users/api/roles/create/')
        self.assertEqual(resolver.view_name, 'api_create_role')
        resolver = resolve('/manage-users/api/roles/edit/99/')
        self.assertEqual(resolver.view_name, 'api_edit_role')
        resolver = resolve('/manage-users/api/roles/delete/99/')
        self.assertEqual(resolver.view_name, 'api_delete_role')
        resolver = resolve('/manage-users/api/activities/')
        self.assertEqual(resolver.view_name, 'api_get_activities')

    # Simply check that they all return 302 (because we aren't logged in with permission to view)
    # Don't actually modify data
    def test_apis_up(self):
        response = self.client.get('/manage-users/api/activities/')
        self.assertEqual(response.status_code, 302)

        response = self.client.get('/manage-users/api/roles/')
        self.assertEqual(response.status_code, 302)

        response = self.client.get('/manage-users/api/users/')
        self.assertEqual(response.status_code, 302)
        
        # TODO How do you get a normal request to the view so that the view can pull out a company?
        # Or would it bet better to pass a company object directly?


        # response = self.client.get('/manage-users/api/roles/',  request)
        # print response.status_code
        # self.assertEqual(response.status_code, 200)

        # for x in range(0, 10):
        #     response = self.client.get('/manage-users/api/roles/' + randint(0,50) + '/')
        #     self.assertEqual(response.status_code, 200)
        #
        #     # Won't edit data. Requires POST method.
        #     response = self.client.get('/manage-users/api/roles/edit/' + randint(0,50) + '/')
        #     self.assertEqual(response.status_code, 200)
        #
        #     # Won't edit data. Requires DELETE method.
        #     response = self.client.get('/manage-users/api/roles/delete/' + randint(0,50) + '/')
        #     self.assertEqual(response.status_code, 200)
        #
        # # Won't edit data. Requires POST method.
        # response = self.client.get('/manage-users/api/roles/create/')
        # self.assertEqual(response.status_code, 200)
