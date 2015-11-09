import json
from django.core import mail
from django.core.urlresolvers import reverse, resolve

from mock import patch
from tastypie.models import create_api_key

from myjobs.models import User, Role, Activity
from myjobs.tests.factories import UserFactory
from myjobs.tests.test_views import TestClient
from myprofile.models import SecondaryEmail
from mysearches.models import SavedSearch
from mysearches.tests.helpers import return_file
from setup import MyJobsBase

from random import randint
from seo.tests.factories import CompanyFactory
from django.test.client import RequestFactory


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
        # Connects to correct view
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

    # Simply check that they all return 200
    # Don't actually modify data
    def test_apis_up(self):
        response = self.client.get('/manage-users/api/activities/')
        self.assertEqual(response.status_code, 200)

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
        #











# Test:
# manage-users/
# manage-users/api/roles/
# manage-users/api/roles/(?P<role_id>[0-9]+)/
# manage-users/api/roles/create/
# manage-users/api/roles/edit/(?P<role_id>[0-9]+)/
# manage-users/api/roles/delete/(?P<role_id>[0-9]+)/
# manage-users/api/activities/$






#     def test_create_new_user(self):
#         self.assertEqual(len(mail.outbox), 0)
#         response = self.client.get()
#         self.assertEqual(len(mail.outbox), 1)
#         self.assertEqual(mail.outbox[0].subject,
#                          'Account Activation for my.jobs')
#         content = json.loads(response.content)
#         self.assertEqual(content,
#                          {'user_created': True,
#                           'email': 'foo@example.com'})
#         self.assertEqual(response.status_code, 200)
#         self.assertEqual(User.objects.count(), 2)
#         user = User.objects.get(email=self.client.data['email'])
#         for field, value in [('is_active', True), ('is_verified', False)]:
#             self.assertEqual(getattr(user, field), value)
#
#     def test_no_email(self):
#         self.client.data['email'] = ''
#         response = self.client.get()
#         content = json.loads(response.content)
#         self.assertEqual(response.status_code, 200)
#         self.assertEqual(content['email'], 'No email provided')
#
#     def test_existing_user(self):
#         for email in [self.user.email, self.user.email.upper()]:
#             self.client.data['email'] = email
#             response = self.client.get()
#             content = json.loads(response.content)
#             self.assertEqual(response.status_code, 200)
#             self.assertFalse(content['user_created'])
#             self.assertEqual(content['email'].lower(), 'alice@example.com')
#
#
# class SavedSearchResourceTests(MyJobsBase):
#     def setUp(self):
#         super(SavedSearchResourceTests, self).setUp()
#         self.user = UserFactory()
#         self.client = TestClient(
#             path='/api/v1/savedsearch/',
#             data={'email': 'alice@example.com',
#                   'url': 'www.my.jobs/jobs'})
#         create_api_key(User, instance=self.user, created=True)
#
#         self.patcher = patch('urllib2.urlopen', return_file())
#         self.patcher.start()
#
#     def tearDown(self):
#         super(SavedSearchResourceTests, self).tearDown()
#         self.patcher.stop()
#
#     def test_new_search_existing_user(self):
#         for data in [('alice@example.com', 'www.my.jobs/search?q=django'),
#                      ('ALICE@EXAMPLE.COM', 'www.my.jobs/search?q=python')]:
#             self.client.data['email'] = data[0]
#             self.client.data['url'] = data[1]
#             self.client.data['username'] = self.user.email
#             self.client.data['api_key'] = self.user.api_key.key
#             response = self.client.get()
#             self.assertEqual(response.status_code, 200)
#             search = SavedSearch.objects.all()[0]
#             self.assertEqual(search.user, self.user)
#             content = json.loads(response.content)
#             self.assertEqual(len(content), 3)
#             self.assertTrue(content['new_search'])
#         self.assertEqual(SavedSearch.objects.filter(user=self.user).count(), 2)
#
#         self.client.data['url'] = 'http://www.my.jobs/jobs'
#         self.client.get()
#
#         for search in SavedSearch.objects.all():
#             self.assertTrue('www.my.jobs' in search.notes)
#
#     def test_new_search_new_user(self):
#         self.client.data['email'] = 'new@example.com'
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         self.assertEqual(SavedSearch.objects.count(), 0)
#         self.assertEqual(User.objects.count(), 1)
#         content = json.loads(response.content)
#         self.assertEqual(content['error'],
#                          'No user with email %s exists' % self.client.data['email'])
#         self.assertEqual(len(content), 1)
#
#     def test_new_search_secondary_email(self):
#         SecondaryEmail.objects.create(user=self.user,
#                                       email='secondary@example.com')
#         self.client.data['email'] = 'secondary@example.com'
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         self.assertEqual(SavedSearch.objects.count(), 1)
#         self.assertEqual(User.objects.count(), 1)
#         search = SavedSearch.objects.all()[0]
#         self.assertEqual(search.user, self.user)
#         self.assertEqual(search.email, 'secondary@example.com')
#         content = json.loads(response.content)
#         self.assertEqual(len(content), 3)
#
#     def test_new_search_invalid_url(self):
#         self.client.data['url'] = 'google.com'
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         content = json.loads(response.content)
#         self.assertEqual(len(content), 1)
#         self.assertEqual(content['error'], 'This is not a valid .JOBS feed')
#         self.assertEqual(SavedSearch.objects.count(), 0)
#
#     def test_new_search_no_url(self):
#         del self.client.data['url']
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         content = json.loads(response.content)
#         self.assertEqual(len(content), 1)
#         self.assertEqual(content['error'], 'No .JOBS feed provided')
#         self.assertEqual(SavedSearch.objects.count(), 0)
#
#     def test_no_email(self):
#         del self.client.data['email']
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         content = json.loads(response.content)
#         self.assertEqual(len(content), 1)
#         self.assertEqual(content['error'], 'No email provided')
#         self.assertEqual(SavedSearch.objects.count(), 0)
#
#     def test_no_auth(self):
#         response = self.client.get()
#         self.assertEqual(response.status_code, 401)
#         self.assertEqual(response.content, '')
#         self.assertEqual(SavedSearch.objects.count(), 0)
#
#     def test_invalid_auth(self):
#         headers = [(self.user.email, 'invalid_key'),
#                    ('invalid_user@example.com', self.user.api_key.key),
#                    ('invalid_user@example.com', 'invalid_key')]
#
#         for header in headers:
#             self.client.data['username'] = header[0]
#             self.client.data['api_key'] = header[1]
#             response = self.client.get()
#             self.assertEqual(response.status_code, 401)
#             self.assertEqual(response.content, '')
#             self.assertEqual(SavedSearch.objects.count(), 0)
#
#     def test_existing_search(self):
#         self.client.data['username'] = self.user.email
#         self.client.data['api_key'] = self.user.api_key.key
#         response = self.client.get()
#         self.assertEqual(response.status_code, 200)
#         content = json.loads(response.content)
#         self.assertEqual(content['new_search'], True)
#
#         for email in [self.user.email, self.user.email.upper()]:
#             self.client.data['email'] = email
#             response = self.client.get()
#             content = json.loads(response.content)
#             self.assertEqual(len(content), 3)
#             self.assertFalse(content['new_search'])
#         self.assertEqual(SavedSearch.objects.count(), 1)
#
#     def test_user_creation_source_override(self):
#         """
#         Providing a source parameter to the account creation API should
#         override user.source with its value.
#         """
#         self.client.get(
#             reverse('toolbar') + '?site_name=Indianapolis%20Jobs&site=http%3A%2F%2Findianapolis.jobs&callback=foo',
#             HTTP_REFERER='http://indianapolis.jobs')
#
#         self.client.data['source'] = 'redirect'
#         self.client.get()
#
#         user = User.objects.get(email=self.client.data['email'])
#         self.assertTrue(user.source, self.client.data['source'])
