from django.core.urlresolvers import reverse
from myjobs.tests.factories import UserFactory
from mypartners.forms import ContactForm, ContactRecordForm
from mypartners.models import Contact, Location, ContactRecord
from mypartners.tests.factories import ContactFactory, ContactRecordFactory
from mypartners.tests.test_views import MyPartnersTestCase
from mysearches.tests.factories import PartnerSavedSearchFactory
from mysearches.forms import PartnerSavedSearchForm 

class ContactFormTests(MyPartnersTestCase):
    def setUp(self):
        super(ContactFormTests, self).setUp()
        self.data = {}
        for field in Contact._meta.fields:
            self.data[field.attname] = getattr(self.contact, field.attname,
                                               None)
        self.data['partner'] = self.partner.pk
        self.data['user'] = self.contact.user.pk

    def test_disable_email_changing_for_existing_user(self):
        """
        You shouldn't be able to edit the email for contacts that have
        been attached to users.

        """
        self.data['email'] = 'not@thecontact.email'
        self.data['company_id'] = 1
        form = ContactForm(instance=self.contact, data=self.data)
        self.assertTrue(form.is_valid())
        form.save(self.staff_user, self.partner.pk)
        self.assertNotEqual(self.contact.email, self.data['email'])
        email_count = Contact.objects.filter(email=self.data['email']).count()
        self.assertEqual(email_count, 0)

    def test_input_sanitized(self):
        """
        Test that extra whitespace is stripped when saving the form. This works
        because ContactForm is a subclass of
        universal.form.NormalizedModelForm.
        """
        self.data['name'] = "                    John    Doe            "
        self.data['company_id'] = 1
        form = ContactForm(instance=self.contact, data=self.data)
        self.assertTrue(form.is_valid())
        form.save(self.staff_user, self.partner.pk)
        
        contact = Contact.objects.get(email=self.data['email'])
        self.assertEqual(contact.name, "John Doe")

    def test_location_from_contact(self):
        """
        If location information is inputted (include address label/name), then
        a location should be created along with the contact.
        """

        data = {
            "name": "John Doe",
            "partner": self.partner.pk
        }
        address_info = {
            'label': 'Home',
            'address_line_one': "123 Fake St",
            'address_line_two': "Ste 321",
            'city': "Somewhere",
            "state": "NM"}
        data.update(address_info)
        data['company_id'] = 1
        form = ContactForm(data=data)
        self.assertTrue(form.is_valid())
        form.save(self.staff_user, self.partner.pk)

        self.assertTrue(Location.objects.filter(**address_info).exists())

class PartnerSavedSearchFormTests(MyPartnersTestCase):
    def test_partner_saved_search_form_from_instance(self):
        user = UserFactory(email='user@example.com')
        ContactFactory(user=user, partner=self.partner)
        partner_saved_search = PartnerSavedSearchFactory(
            created_by=self.staff_user, provider=self.company,
            partner=self.partner, user=user, notes='')
        response = self.client.get(reverse('partner_edit_search') +
                                   '?partner=%s&id=%s' % (
                                       self.partner.pk,
                                       partner_saved_search.pk))
        self.assertTrue(partner_saved_search.feed in response.content)


class ContactRecordFormTests(MyPartnersTestCase):
    def setUp(self):
        super(ContactRecordFormTests, self).setUp()

        self.contact_record = ContactRecordFactory(
            contact=self.contact, partner=self.partner)

        # The contact record form has a lot of required fields.
        self.data = {
            'contact_type': self.contact_record.contact_type,
            'contact': self.contact_record.contact.pk,
            'contact_email': self.contact_record.contact_email,
            'length_0': "00",
            'length_1': "30",
            'date_time_0': "Aug",
            'date_time_1': "24",
            'date_time_2': "2015",
            'date_time_3': "03",
            'date_time_4': "10",
            'date_time_5': "PM",
            'notes': self.contact_record.notes,
            'partner': self.contact_record.partner.pk,
            'company': self.contact_record.partner.owner
        }
        self.form = ContactRecordForm(
            instance=self.contact_record, partner=self.partner, data=self.data)

        # add a few contact records so that we have some to select from
        ContactRecordFactory.create_batch(3, partner=self.partner,
                                          contact=self.contact,
                                          contact_type='phone')

        self.client.path = reverse(
            "partner_edit_record") + "?partner=%s" % self.partner.pk


    def test_archived_contacts_not_shown(self):
        """Test that archived contacts aren't selectable."""

        self.assertIn(self.contact, self.form.fields['contact'].queryset)

        self.contact.delete()
        form = ContactRecordForm(partner=self.partner)
        self.assertNotIn(self.contact, form.fields['contact'].queryset)

    def test_that_creating_a_record_redirects_properly(self):
        """
        Tests that when you create a record, you are redirected to the view
        which contains that record.
        """
        self.data.update({
            "notes": "brand new record"
        })

        record_count = ContactRecord.objects.count()

        response = self.client.post(data=self.data, follow=True)
        self.assertEqual(response.status_code, 200)

        self.assertEqual(ContactRecord.objects.count(), record_count + 1)
        self.assertIn("brand new record", response.content)


    def test_changing_contact_type_redirects_correctly(self):
        """
        Test that when saving a contact record, you are redirected to the view
        which contains that record, even if you changed the contact type.
        """

        # the contact record we are interested in modifying and returning to
        contact_record = ContactRecord.objects.all()[2]
        # sanity check to make sure notes aren't modified yet
        self.assertEqual(contact_record.notes, "Some notes go here.")
        
        self.data.update({
            "contact_type": "phone",
            "contact_phone": "555-555-5555",
            "notes": "some test notes"
        })
        response = self.client.post(path=self.client.path + '&page=2',
                                    data=self.data, follow=True)
        self.assertEqual(response.status_code, 200)

        self.assertIn("some test notes", response.content)

    def test_that_backdating_a_record_redirects_correctly(self):
        """
        Test that when saving a contact record, you are redirected to the view
        which contains that record, even if back-date the record.
        """

        # the contact record we are interested in modifying and returning to
        contact_record = ContactRecord.objects.all()[1]
        # sanity check to make sure notes aren't modified yet
        self.assertEqual(contact_record.notes, "Some notes go here.")
        
        self.data.update({
            'date_time_2': "2012",
            "notes": "some test notes"
        })
        response = self.client.post(path=self.client.path + '&page=2',
                                    data=self.data, follow=True)
        self.assertEqual(response.status_code, 200)

        self.assertIn("some test notes", response.content)

