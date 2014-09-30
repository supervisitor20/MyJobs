from mock import patch

from myjobs.tests.setup import MyJobsBase
from mypartners.tests.factories import ContactFactory, PartnerFactory
from mysearches.forms import SavedSearchForm, PartnerSavedSearchForm
from mysearches.tests.helpers import return_file
from mysearches.tests.factories import SavedSearchFactory
from myjobs.tests.factories import UserFactory
from registration.models import Invitation
from seo.tests import CompanyFactory


class SavedSearchFormTests(MyJobsBase):
    def setUp(self):
        super(SavedSearchFormTests, self).setUp()
        self.user = UserFactory()
        self.data = {'url': 'http://www.my.jobs/jobs',
                     'feed': 'http://www.my.jobs/jobs/feed/rss?',
                     'email': 'alice@example.com',
                     'frequency': 'D',
                     'label': 'All jobs from www.my.jobs',
                     'sort_by': 'Relevance'}

        self.patcher = patch('urllib2.urlopen', return_file())
        self.patcher.start()

    def tearDown(self):
        super(SavedSearchFormTests, self).tearDown()
        self.patcher.stop()

    def test_successful_form(self):
        form = SavedSearchForm(user=self.user,data=self.data)
        self.assertTrue(form.is_valid())

    def test_invalid_url(self):
        self.data['url'] = 'http://google.com'
        form = SavedSearchForm(user=self.user,data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['url'][0], 'This URL is not valid.')

    def test_day_of_week(self):
        self.data['frequency'] = 'W'
        form = SavedSearchForm(user=self.user,data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['day_of_week'][0], 'This field is required.')

        self.data['day_of_week'] = '1'
        form = SavedSearchForm(user=self.user,data=self.data)        
        self.assertTrue(form.is_valid())

    def test_day_of_month(self):
        self.data['frequency'] = 'M'
        form = SavedSearchForm(user=self.user,data=self.data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['day_of_month'][0], 'This field is required.')

        self.data['day_of_month'] = '1'
        form = SavedSearchForm(user=self.user,data=self.data)        
        self.assertTrue(form.is_valid())

    def test_duplicate_url(self):
        original = SavedSearchFactory(user=self.user)
        form = SavedSearchForm(user=self.user,data=self.data)

        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors['url'][0], 'URL must be unique.')


class PartnerSavedSearchFormTests(MyJobsBase):
    def setUp(self):
        super(PartnerSavedSearchFormTests, self).setUp()
        self.user = UserFactory()
        self.company = CompanyFactory()
        self.partner = PartnerFactory(owner=self.company)
        self.contact = ContactFactory(user=self.user,
                                      partner=self.partner)
        self.data = {
            'user': self.user,
            'url': 'http://www.my.jobs/jobs',
            'feed': 'http://www.my.jobs/jobs/feed/rss?',
            'email': self.user.email,
            'frequency': 'D',
            'label': 'All jobs from www.my.jobs',
            'sort_by': 'Relevance'
        }

        self.patcher = patch('urllib2.urlopen', return_file())
        self.mock_urlopen = self.patcher.start()

    def tearDown(self):
        super(PartnerSavedSearchFormTests, self).tearDown()
        try:
            self.patcher.stop()
        except RuntimeError:
            # patcher was stopped in a test
            pass

    def test_partner_saved_search_form_creates_invitation(self):
        form = PartnerSavedSearchForm(partner=self.partner, data=self.data)
        instance = form.instance
        instance.feed = form.data['feed']
        instance.provider = self.company
        instance.partner = self.partner
        instance.created_by = self.user
        instance.custom_message = instance.partner_message
        form.is_valid()
        form.save()
        self.assertEqual(Invitation.objects.count(), 1)
