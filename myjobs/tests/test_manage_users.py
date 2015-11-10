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
