from bs4 import BeautifulSoup
import json

from django.core.urlresolvers import reverse

from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import UserFactory
from myprofile.tests.factories import AddressFactory, PrimaryNameFactory, \
    SummaryFactory
from myprofile.models import Name


class MyProfileViewsTests(MyJobsBase):
    def setUp(self):
        super(MyProfileViewsTests, self).setUp()
        self.client = TestClient()
        self.client.login_user(self.user)
        self.name = PrimaryNameFactory(user=self.user)


    def test_edit_profile(self):
        """
        Going to the edit_profile view generates a list of existing profile
        items in the main content section and a list of profile sections that
        don't have data filled out in the sidebar.
        """
        resp = self.client.get(reverse('view_profile'))

        soup = BeautifulSoup(resp.content)
        item = soup.find('div', id='profileTitleBar')

        # Page should have fake user's email as title
        self.assertIsNotNone(soup.find_all('h3', text="alice@example.com"))

        # The only module that is complete at this point is 'Name'. So there
        # should only be one module displayed in the moduleColumn div
        self.assertEquals(1, len(soup.findAll("div", { "class" : "card-wrapper" })))

        # The 'Add a New Section' section should have many items
        # Check for each one
        self.assertEquals(10, len(soup.findAll("tr", { "class" : "profile-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Education-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Address-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Telephone-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Employment History-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Secondary Email-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Military Service-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Website-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "License-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Summary-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Volunteer History-new-section" })))
        self.assertEquals(1, len(soup.findAll("a", { "id" : "Summary-new-section" })))


    def test_handle_form_post_new_valid(self):
        """
        Invoking the handle_form view as a POST request for a new item
        creates that object in the database and returns the item snippet
        to be rendered on the page.
        """

        resp = self.client.post(reverse('handle_form'),
                                data={'module': 'Name', 'id': 'new',
                                      'given_name': 'Susy',
                                      'family_name': 'Smith'})
        self.assertRedirects(resp, reverse('view_profile'))
        self.assertEqual(Name.objects.filter(given_name='Susy',
                                             family_name='Smith').count(), 1)


    def test_delete_item(self):
        """
        Invoking the delete_item view deletes the item and returns
        the 'Deleted!' HttpResponse
        """

        resp = self.client.post(reverse('delete_item')+'?item='+str(self.name.id))

        self.assertEqual(resp.content, '')
        self.assertEqual(Name.objects.filter(id=self.name.id).count(), 0)


    def test_edit_summary(self):
        """
        See test_edit_profile
        """
        summary = SummaryFactory(user=self.user)
        resp = self.client.get(reverse('view_profile'))
        soup = BeautifulSoup(resp.content)

        item = soup.find('div', id='summary-' + str(summary.id) + '-item')
        self.assertIsNotNone(item)

        link = item.find('a').attrs['href']
        resp = self.client.get(link)
        self.assertEqual(resp.status_code, 200)


    def test_handle_form_post_invalid(self):
        """
        Invoking the handle_form view as a POST request with an invalid
        form returns the list of form errors.
        """
        resp = self.client.post(reverse('handle_form'),
                                data={'module': 'Name', 'id': 'new',
                                      'given_name': 'Susy'},
                                HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertEqual(json.loads(resp.content),
                         {u'family_name': [u'This field is required.']})

        resp = self.client.post(reverse('handle_form'),
                                data={'module': 'Name', 'id': 'new',
                                      'family_name': 'Smithers'},
                                HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertEqual(json.loads(resp.content),
                         {u'given_name': [u'This field is required.']})


    def test_handle_form_post_existing_valid(self):
        """
        Invoking the handle_form view as a POST request for an existing
        item updates that item and returns the update item snippet.
        """
        resp = self.client.post(reverse('handle_form'),
                                data={'module': 'Name', 'id': self.name.id,
                                      'given_name': 'Susy',
                                      'family_name': 'Smith'})

        self.assertRedirects(resp, reverse('view_profile'))
        self.assertEqual(Name.objects.filter(given_name='Susy',
                                             family_name='Smith').count(), 1)


    def test_handle_form_json_serialize_get(self):
        """When an ajax requests wants to GET json, serialize the form."""
        resp = self.client.get(reverse('handle_form'),
                               HTTP_ACCEPT='application/json',
                               data={'module': 'Name'})
        self.assertEquals(200, resp.status_code)
        self.assertIn('application/json', resp['content-type'])
        data = json.loads(resp.content)
        self.assertEquals(3, len(data['ordered_fields']))
        self.assertIsInstance(data['ordered_fields'], list)
        self.assertEquals(3, len(data['fields']))
        self.assertIsInstance(data['fields'], dict)
        self.assertIsInstance(data['fields']['family_name'], dict)
        self.assertIsInstance(data['fields']['given_name'], dict)
        self.assertIsInstance(data['fields']['primary'], dict)
        self.assertEquals(3, len(data['data']))
        self.assertIsInstance(data['data'], dict)


    def test_add_duplicate_primary_email(self):
        """
        Attempting to add a secondary email with a value equal to the user's
        current primary email results in an error.

        Due to how the instance is constructed, this validation is form-level
        rather than model-level.
        """
        resp = self.client.post(reverse('handle_form'),
                                data={'module': 'SecondaryEmail',
                                      'id': 'new',
                                      'email': self.user.email},
                                HTTP_X_REQUESTED_WITH='XMLHttpRequest')

        self.assertEqual(json.loads(resp.content),
                         {u'email': [u'This email is already registered.']})
