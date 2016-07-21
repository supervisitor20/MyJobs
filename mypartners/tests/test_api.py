import json

from django.core.urlresolvers import reverse

from mypartners.tests.test_views import MyPartnersTestCase
from mypartners.tests.factories import (OutreachEmailAddressFactory,
                                        OutreachRecordFactory,
                                        OutreachWorkflowStateFactory,
                                        TagFactory,
                                        PartnerFactory,
                                        LocationFactory)
from myjobs.tests.factories import UserFactory
from myjobs.models import Activity
from mypartners.models import (OutreachEmailAddress, Partner, Contact,
                               ContactRecord, Location, Tag)


class NonUserOutreachTestCase(MyPartnersTestCase):
    """
    Tests related to the non user outreach single page app. These APIs
    provide data to the React-based application.

    """

    def setUp(self):
        super(NonUserOutreachTestCase, self).setUp()
        self.inbox = OutreachEmailAddressFactory(company=self.company)
        self.other_company_inbox = OutreachEmailAddressFactory()
        self.outreach_record = OutreachRecordFactory(outreach_email =
                                                     self.inbox)
        self.other_record = OutreachRecordFactory(outreach_email =
                                                  self.other_company_inbox)
        self.role.activities.add(*self.activities)

    def test_inbox_list_api(self):
        """
        Verify that the inbox list API will properly return any inboxes
        for the current company.

        """
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code, 200, msg="expected status 200, "
                                                        "got %s, may be roles "
                                                        "or perms issue" %
                         response.status_code)
        response_json = json.loads(response.content)

        self.assertEqual(len(response_json), 1, msg="assert only user's "
                                                    "company's inbox returned")

        return_msg = "error loading inbox api, expected {0}, got {1}"
        self.assertEqual(
            response_json[0]["pk"], self.inbox.pk,
            msg=return_msg.format(response_json[0]["pk"], self.inbox.pk))
        self.assertEqual(response_json[0]["email"], self.inbox.email,
                         msg=return_msg.format(response_json[0]["email"],
                                               self.inbox.email))

    def test_non_staff_cannot_use_view(self):
        """
        Temporary test. Ensure user cannot access this view if they are not
        staff. Remove when launching NonUserOutreach module.

        """
        non_staff_user = UserFactory(is_staff=False, email="testuser@test.com")
        self.client.login_user(non_staff_user)
        response = self.client.get(reverse('api_get_nuo_inbox_list'), follow=False)
        self.assertEqual(response.status_code, 404, msg="ensure NUO inboxes "
                                                        "returns 404 for non "
                                                        "staff users")

    def test_user_requires_prm_access(self):
        """
        Verify that the has_access("prm") decorator works properly.

        """
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code, 200, msg="assert view loaded "
                                                        "properly for prm "
                                                        "access user")

        non_company_user = UserFactory(email="testuser@test.com")
        self.client.login_user(non_company_user)
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code,
                         404,
                         msg="assert NUO inboxes returns 404 for a user that "
                             "is not a company user for a member company")

    def test_add_new_inbox(self):
        """Tests that a user can create a new outreach inbox."""

        response = self.client.post(reverse('api_add_nuo_inbox'),
                                    {"email": "testemail"})
        data = json.loads(response.content)
        inbox = OutreachEmailAddress.objects.last()
        self.assertEqual(inbox.pk, data["pk"],
                         "Was expecting an inbox to be created with a pk of "
                         "%s, but the latest one has a pk of %s." % (
                             inbox.pk, data["pk"]))

    def test_remove_inbox(self):
        """Tests that a user can delete an existing outreach inbox."""

        inbox = OutreachEmailAddressFactory(email="testemail")
        response = self.client.post(reverse('api_delete_nuo_inbox'),
                                    {'id': inbox.pk})
        data = json.loads(response.content)
        self.assertEqual(data["status"], "success")
        self.assertFalse(
            OutreachEmailAddress.objects.filter(pk=inbox.pk).exists(),
            "Inbox %s should have been deleted, but wasn't" % inbox.pk)

    def test_update_inbox(self):
        """Tests that an inbox can be updated through the api."""

        inbox = OutreachEmailAddressFactory(email="testemail")
        response = self.client.post(reverse('api_update_nuo_inbox'),
                                    {'id': inbox.pk, 'email': 'newemail'})
        data = json.loads(response.content)
        self.assertEqual(data["status"],  "success")
        self.assertEqual(OutreachEmailAddress.objects.get(pk=inbox.pk).email,
                         'newemail')

    def test_records_list_api(self):
        """
        Verify that the outreach records list API will properly return any
        records for the current company.

        """
        response = self.client.get(reverse('api_get_nuo_records_list'))
        self.assertEqual(response.status_code, 200, msg="expected status 200, "
                                                        "got %s, may be roles "
                                                        "or perms issue" %
                         response.status_code)
        response_json = json.loads(response.content)

        self.assertEqual(
            len(response_json), 1,
            msg="assert only user's company's record returned")

        return_msg = "error loading records api, expected {0}, got {1}"
        self.assertEqual(
            response_json[0]["fromEmail"], self.outreach_record.from_email,
            msg=return_msg.format(response_json[0]["fromEmail"],
                                  self.outreach_record.from_email))
        self.assertEqual(
            response_json[0]["outreachEmail"], self.inbox.email + "@my.jobs",
            msg=return_msg.format(response_json[0]["outreachEmail"],
                                  self.inbox.email + "@my.jobs"))

    def test_individual_record_api(self):
        """
        Test the record API given the logged in user is a member of the same
        company.

        """
        # test to ensure current company's record will return
        response = self.client.get(reverse('api_get_individual_nuo_record'),
                                   {"record_id": self.outreach_record.pk})
        self.assertEqual(response.status_code, 200, msg="expected status 200, "
                                                        "got %s, may be roles "
                                                        "or perms issue" %
                                                        response.status_code)
        response_json = json.loads(response.content)

        self.assertNotEqual(response_json, {}, msg="empty object was returned,"
                                                   "record information was "
                                                   "expected.")

        return_msg = "error loading record information, expected {0}, got {1}"
        self.assertEqual(response_json["from_email"],
                         self.outreach_record.from_email,
                         msg=return_msg.format(response_json["from_email"],
                                               self.outreach_record.from_email))
        self.assertEqual(response_json["outreach_email"],
                         self.inbox.email + "@my.jobs",
                         msg=return_msg.format(response_json["outreach_email"],
                                               self.inbox.email + "@my.jobs"))

        # test to ensure other company's record will not return
        response = self.client.get(reverse('api_get_individual_nuo_record'),
                                   {"record_id": self.other_record.pk})

        response_json = json.loads(response.content)

        self.assertEqual(response_json, {}, msg="record information was "
                                                "returned for a non-company "
                                                "record.")

class NUOConversionAPITestCase(MyPartnersTestCase):
    """
    Tests related to the conversion API for non user outreach. This API
    accepts a data object with information to create partners, contacts,
    and contact records, as well as marking a NUO record as reviewed.

    """

    def setUp(self):
        super(NUOConversionAPITestCase, self).setUp()
        self.inbox = OutreachEmailAddressFactory(company=self.company)
        self.other_company_inbox = OutreachEmailAddressFactory()
        self.outreach_record = OutreachRecordFactory(outreach_email =
                                                     self.inbox)
        self.role.activities.add(*self.activities)
        self.outreach_workflow = OutreachWorkflowStateFactory()
        a_tag = TagFactory()
        self.request_data =  {
            "outreachrecord":{"pk":self.outreach_record.pk, "current_workflow_state":self.outreach_workflow.pk},

            "partner": {"pk":"", "name":"James B", "data_source":"email", "uri":"http://www.example.com",
            "tags":[a_tag.pk], "owner": self.company.pk, "approval_status": "3"},

            "contact": {"pk":"", "name":"Nicole J", "email":"nicolej@test.com", "phone":"7651234123",
            "locations":[{"pk":"", "address_line_one":"", "address_line_two":"",
            "city":"Newtoneous", "state":"AZ", "country_code":"1",
            "label":"new place"}], "tags":[a_tag.pk], "notes": "long note left here",
            "approval_status":"3"},

            "contactrecord": {"contact_type":"phone", "location":"dining hall", "length":"10:30",
            "subject":"new job", "date_time":"2016-01-01 05:10", "notes":"dude was chill",
            "job_id":"10", "job_applications":"20", "job_interviews":"10", "job_hires":"0",
            "tags":[a_tag.pk], "approval_status":"1"}
        }

    def test_outreach_conversion_api(self):
        """
        Test that the conversion API properly creates partner, contact,
        and contact records, as well as updating a given outreach record
        when used.

        """
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')
        self.check_status_code_and_objects(response, 200, 4)

    def test_outreach_api_all_fields_required(self):
        """
        Test that the outreach conversion API forces the inbound data object
        to have all relevant fields

        """
        self.request_data.pop('partner')
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')
        self.check_status_code_and_objects(response, 400, 0)

    def test_outreach_api_rejects_non_post_calls(self):
        """
        Test that the outreach conversion API rejects calls that are not POST

        """
        response = self.client.get(reverse('api_convert_outreach_record'))
        self.check_status_code_and_objects(response, 405, 0)

    def test_outreach_api_can_link_existing_records(self):
        """
        Test that the outreach conversion API can link to existing records
        with a PK

        """
        existing_partner = PartnerFactory(owner=self.company)
        self.request_data['partner']['pk'] = existing_partner.pk
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 200, 3)

        dict_contact = Contact.objects.get(name="Nicole J")
        self.assertEqual(dict_contact.partner.pk, existing_partner.pk,
                         msg="New contact does not link to provided partner,"
                             "expected pk of %s, got %s" % (existing_partner.pk,
                                                            dict_contact.partner.pk))

    def test_outreach_api_contact_locations(self):
        """
        Test that the outreach conversion API allows the member to add multiple
        locations as well as locations via PK

        """
        existing_location = LocationFactory()
        self.request_data['contact']['locations'].append({"pk":existing_location.pk})
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 200, 4)

        dict_contact = Contact.objects.get(name="Nicole J")
        self.assertEqual(dict_contact.locations.count(), 2,
                         msg="Contact locations not added corrected by API,"
                             " contact had %s locations, expected %s"
                             % (dict_contact.locations.count(), 2))

    def test_outreach_api_contact_no_locations(self):
        """
        Test that the outreach conversion API allows a contact to have no
        locations.

        """
        self.request_data['contact'].pop('locations')
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 200, 3)

        dict_contact = Contact.objects.get(name="Nicole J")
        self.assertEqual(dict_contact.locations.count(), 0,
                         msg="Contact locations not added corrected by API,"
                             " contact had %s locations, expected %s"
                             % (dict_contact.locations.count(), 0))

    def test_outreach_api_no_data(self):
        """
        Test that the outreach conversion API does nothing if not given a
        data dict

        """
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps({}),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 400, 0)

    def test_outreach_api_invalid_data(self):
        """
        Test that the outreach conversion API does nothing if not given a
        data dict

        """
        self.request_data['dummystuff'] = "invalid stuff"
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 400, 0)

    def test_outreach_api_invalid_field_data(self):
        """
        Test that the outreach conversion API does not create any objects
        if a model fails form validation

        """
        self.request_data['contactrecord']['date_time'] = "invalid dt"
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 400, 0)

    def test_convert_permission(self):
        """
        Test that the outreach conversion API does not operate without convert
        permission

        """
        convert = Activity.objects.get(name="convert outreach record")
        self.role.activities.remove(convert)
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        self.check_status_code_and_objects(response, 403, 0)

    def test_contact_permission(self):
        """
        Test that the outreach conversion API does not allow contact creation
        without create contact permission

        """
        create = Activity.objects.get(name="create contact")
        self.role.activities.remove(create)
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        parsed_content = json.loads(response.content)
        contact_errors = [i['message'] for i in
                          parsed_content['form_errors']['contact']]

        self.assertEqual(len(contact_errors), 1,
                         msg="Expected 1 error in partner form, got %s, "
                             "errors: %s" % (len(contact_errors),
                                             ', '.join(contact_errors)))

        self.assertEqual(contact_errors[0],
                         "User does not have permission to create a contact.",
                         msg="Unexpected error msg: %s " % contact_errors[0])

    def test_partner_permission(self):
        """
        Test that the outreach conversion API does not allow partner creation
        without create partner permission

        """
        create = Activity.objects.get(name="create partner")
        self.role.activities.remove(create)
        response = self.client.post(reverse('api_convert_outreach_record'),
                                    json.dumps(self.request_data),
                                    content_type='application/json')

        parsed_content = json.loads(response.content)
        partner_errors = [i['message'] for i in
                          parsed_content['form_errors']['partner']]

        self.assertEqual(len(partner_errors), 1,
                         msg="Expected 1 error in partner form, got %s, "
                             "errors: %s" % (len(partner_errors),
                                             ', '.join(partner_errors)))

        self.assertEqual(partner_errors[0],
                         "User does not have permission to create a partner.",
                         msg="Unexpected error msg: %s " % partner_errors[0])


        self.check_status_code_and_objects(response, 400, 0)

    def check_status_code_and_objects(self, response, expected_code,
                                      expected_count):
        """
        Helper method to keep code DRY. Check the status code is what is
        expected. Verify that a certain number of objects from the request
        data was created.

        :param expected_code: What status code is expected
        :param expected_count: How many objects should be created

        """
        self.assertEqual(response.status_code, expected_code,
                         msg="request failed, expected status %s, got %s, "
                             "reponse content was: %s" %
                             (expected_code, response.status_code,
                              response.content))

        objects_created, objects_missing = self.check_objects_created()

        self.assertEqual(len(objects_created), expected_count,
                         msg="unexpected behavior, status code %s but objects "
                             "created: %s, missing: %s" %
                                                 (expected_code,
                                                 ', '.join(objects_created),
                                                 ', '.join(objects_missing)))

    def check_objects_created(self):
        """
        Check how many of the objects from the data dict were created.

        :return: tuple of (objects created, objected missing)

        """
        total_objects = ['partner', 'contact', 'contactrecord', 'location']
        objects_created = []
        if Partner.objects.filter(name="James B"):
            objects_created.append("partner")
        if Contact.objects.filter(name="Nicole J"):
            objects_created.append("contact")
        if ContactRecord.objects.filter(notes="dude was chill"):
            objects_created.append("contactrecord")
        if Location.objects.filter(city="Newtoneous"):
            objects_created.append("location")
        objects_missing = [x for x in total_objects if x not in objects_created]
        return objects_created, objects_missing


class PRMAPITestCase(MyPartnersTestCase):
    def setUp(self):
        super(PRMAPITestCase, self).setUp()

    def test_get_partner(self):
        response = self.client.get(reverse('api_get_partner',
                                           args=[self.partner.pk]))
        payload = json.loads(response.content)
        self.assertTrue(len(payload) > 0)
        for key, value in payload.items():
            self.assertEqual(getattr(self.partner, key), value)

    def test_search_partner_list(self):
        new_partners = 2
        for i in range(new_partners):
            PartnerFactory(owner=self.company, name="Partner %s" % i)

        response = self.client.get(reverse('api_get_partners'))
        payload = json.loads(response.content)
        # There was one pre-existing partner before this test, named "Company",
        # which will be returned when grabbing all partners.
        self.assertEqual(len(payload), new_partners + 1)

        response = self.client.post(reverse('api_get_partners'),
                                    {'q': 'partner'})
        payload = json.loads(response.content)
        # The aforementioned pre-existing partner is missing here.
        self.assertEqual(len(payload), new_partners)

        response = self.client.post(reverse('api_get_partners'),
                                    {'q': '0'})
        payload = json.loads(response.content)
        self.assertEqual(len(payload), 1)

        # We place partners that start with our search query at the beginning.
        # Given a partner named "Company" and two named "Partner X", searching
        # for "p" results in all three results being returned and "Company"
        # being located at the end.
        response = self.client.post(reverse('api_get_partners'),
                                    {'q': 'p'})
        payload = json.loads(response.content)
        self.assertFalse(payload[-1]['name'].startswith('P'))
        for partner in payload[:-1]:
            self.assertTrue(partner['name'].startswith('P'))

    def test_create_partner(self):
        # When creating a partner through the api, we can both add
        # existing tags...
        tag = Tag.objects.create(company=self.company, name='Indiana')
        new_partner = {'name': 'New Partner', 'tags': [tag.name]}
        response = self.client.post(reverse('api_create_partner'), new_partner)
        payload = json.loads(response.content)
        partner = Partner.objects.get(pk=payload['id'])
        self.assertEqual(payload['name'], new_partner['name'])
        self.assertEqual(partner.name, payload['name'])

        # ... or create new tags.
        tag_count = Tag.objects.count()
        new_partner['name'] = 'New Partner 2'
        new_partner['tags'].append('Diversity')
        response = self.client.post(reverse('api_create_partner'), new_partner)
        self.assertEqual(Tag.objects.count(), tag_count + 1)
        payload = json.loads(response.content)
        partner = Partner.objects.get(pk=payload['id'])
        tag = partner.tags.last()
        self.assertEqual(tag.name, new_partner['tags'][-1])

        # We send a 403 response on an attempt to create tags if the user
        # doesn't have permissions.
        new_partner['name'] = 'New Partner 3'
        new_partner['tags'].append('Minority')
        role = self.user.roles.get()
        role.activities.remove(Activity.objects.get(name='create tag'))
        partner_count = Partner.objects.count()
        tag_count = Tag.objects.count()
        response = self.client.post(reverse('api_create_partner'), new_partner)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Tag.objects.count(), tag_count)
        self.assertEqual(Partner.objects.count(), partner_count)
