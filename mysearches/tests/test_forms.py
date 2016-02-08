from django.conf import settings
from django.core import mail
from django.core.urlresolvers import reverse
from django.test import RequestFactory

from myjobs.tests.setup import MyJobsBase
from myjobs.tests.test_views import TestClient
from mypartners.models import Contact
from mypartners.tests.factories import ContactFactory, PartnerFactory
from mysearches.forms import (SavedSearchForm, PartnerSavedSearchForm,
                              PartnerSubSavedSearchForm)
from mysearches.forms import PartnerSavedSearch
from mysearches.tests.factories import SavedSearchFactory
from myjobs.tests.factories import UserFactory
from mypartners.views import partner_savedsearch_save
from registration.models import Invitation
from seo.models import SeoSite
from seo.tests.factories import CompanyFactory, CompanyUserFactory


class SavedSearchFormTests(MyJobsBase):
    def setUp(self):
        super(SavedSearchFormTests, self).setUp()
        self.data = {'url': 'http://www.my.jobs/jobs',
                     'feed': 'http://www.my.jobs/jobs/feed/rss?',
                     'email': self.user.email,
                     'frequency': 'D',
                     'jobs_per_email': 5,
                     'label': 'All jobs from www.my.jobs',
                     'sort_by': 'Relevance'}

    def test_successful_form(self):
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertTrue(form.is_valid())

    def test_invalid_url(self):
        self.data['url'] = 'http://google.com'
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['url'][0], 'This URL is not valid.')

    def test_day_of_week(self):
        self.data['frequency'] = 'W'
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['day_of_week'][0],
                         'This field is required.')

        self.data['day_of_week'] = '1'
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertTrue(form.is_valid())

    def test_day_of_month(self):
        self.data['frequency'] = 'M'
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['day_of_month'][0],
                         'This field is required.')

        self.data['day_of_month'] = '1'
        form = SavedSearchForm(user=self.user, data=self.data)
        self.assertTrue(form.is_valid())

    def test_duplicate_url(self):
        SavedSearchFactory(user=self.user)
        form = SavedSearchForm(user=self.user, data=self.data)

        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['url'][0], 'URL must be unique.')


class PartnerSavedSearchFormTests(MyJobsBase):
    def setUp(self):
        super(PartnerSavedSearchFormTests, self).setUp()
        self.role.activities = self.activities
        CompanyUserFactory(user=self.user, company=self.company)
        self.partner = PartnerFactory(owner=self.company)

        self.contact = ContactFactory(user=None, email='new_user@example.com',
                                      partner=self.partner)
        self.partner_search_data = {
            'url': 'http://www.my.jobs/jobs',
            'feed': 'http://www.my.jobs/jobs/feed/rss?',
            'frequency': 'D',
            'label': 'All jobs from www.my.jobs',
            'sort_by': 'Relevance',
            'jobs_per_email': 5,
            'email': self.contact.email,
            'partner_message': "some partner message"
        }

        settings.SITE = SeoSite.objects.first()
        settings.SITE.canonical_company = self.company
        settings.SITE.save()
        # This request is only used in RequestForms, where all we care about
        # is request.user.
        self.request = RequestFactory().get(
            reverse('partner_savedsearch_save'))
        self.request.user = self.user

        form = PartnerSavedSearchForm(partner=self.partner,
                                      data=self.partner_search_data,
                                      request=self.request)
        instance = form.instance
        instance.provider = self.company
        instance.partner = self.partner
        instance.created_by = self.user
        instance.custom_message = instance.partner_message
        self.assertTrue(form.is_valid())
        self.instance = form.save()

    def test_partner_saved_search_form_creates_invitation(self):
        """
        Saving a partner saved search form should also create
        an invitation
        """
        self.assertEqual(Invitation.objects.count(), 1)
        invitation = Invitation.objects.get()
        self.assertTrue(invitation.invitee.in_reserve)
        contact = Contact.objects.get(pk=self.contact.pk)
        self.assertEqual(invitation.invitee, contact.user)

    def test_partner_saved_search_invitation_has_initial_mail(self):
        """
        When an invitation is created for a partner saved search, the
        invitaiton email should contain the initial saved search and any custom
        message that was inserted into the form.

        """
        url = "%s?partner=%s" % (
            reverse('partner_savedsearch_save'), self.partner.pk)
        response = self.client.post(url, self.partner_search_data)

        email = mail.outbox.pop()
        # inspect email for the custom message
        self.assertIn("some partner message", email.body)
        # inspect the email for the initial saved search
        self.assertIn("My Saved Searches", email.body)

    def test_user_only_linked_to_contact_after_pss_created(self):
        """
        A contact who's email so happens to coincide with an existing user's
        should not be attached to that user until after a partner saved search
        is created for it.
        """

        # we don't have a saved search, so the contact shouldn't be associated
        # with a user
        contact = ContactFactory(user=None,
                                 email="some_random_contact@gmail.com",
                                 partner=self.partner)
        user = UserFactory(email=contact.email)
        self.assertFalse(contact.user)
        self.partner_search_data['email'] = contact.email
        form = PartnerSavedSearchForm(partner=self.partner,
                                      data=self.partner_search_data,
                                      request=self.request)

        instance = form.instance
        instance.provider = self.company
        instance.partner = self.partner
        instance.created_by = self.user
        instance.custom_message = instance.partner_message
        self.assertTrue(form.is_valid())
        form.save()
        # after the saved search was created, the user should have been
        # associated automatically
        contact = Contact.objects.get(id=contact.id)
        self.assertTrue(contact.user)

    def test_sort_by_date_initially(self):
        instance = PartnerSavedSearch.objects.get()
        self.assertEqual(instance.sort_by, 'Date')

    def test_disable_partner_saved_search(self):
        pss = PartnerSavedSearch.objects.get()

        # Partner saved search can be activated/deactivated if unsubscriber
        # is not one of the recipient's email addresses.
        form = PartnerSavedSearchForm(instance=pss, request=self.request,
                                      data=self.partner_search_data)
        self.assertFalse(form.fields['is_active'].widget.attrs.get('disabled',
                                                                   False))

        pss.unsubscriber = pss.email
        pss.save()

        # PRM users can no longer toggle the state of this partner saved search
        # as the user has unsubscribed.
        form = PartnerSavedSearchForm(instance=pss, request=self.request,
                                      data=self.partner_search_data)
        self.assertTrue(form.fields['is_active'].widget.attrs.get('disabled',
                                                                  False))

        # Since the unsubscriber is also the recipient, the recipient can still
        # toggle the state of this partner saved search.
        self.request.user = pss.user
        form = PartnerSubSavedSearchForm(instance=pss, request=self.request,
                                         data=self.partner_search_data)
        self.assertFalse(form.fields['is_active'].widget.attrs.get('disabled',
                                                                   False))
        self.assertTrue(form.is_valid())

    def pssform_last_action_time_updated_on_edit(self):
        """
            Verify saving partner saved search form causes last_action_time to update
        """
        original_time = self.instance.last_action_time
        new_form = PartnerSavedSearchForm(instance=self.instance, request=self.request, data=self.partner_search_data)
        self.assertTrue(new_form.is_valid())
        new_instance = new_form.save()
        self.assertEqual(self.instance.pk, new_instance.pk)
        self.assertNotEqual(new_instance.last_action_time, original_time)

    def pss_sub_form_last_action_time_updated_on_edit(self):
        """
            Verify saving partner saved search sub form causes last_action_time to update
        """
        original_time = self.instance.last_action_time
        new_form = PartnerSubSavedSearchForm(instance=self.instance, request=self.request,
                                             data=self.partner_search_data)
        self.assertTrue(new_form.is_valid())
        new_instance = new_form.save()
        self.assertEqual(self.instance.pk, new_instance.pk)
        self.assertNotEqual(new_instance.last_action_time, original_time)
