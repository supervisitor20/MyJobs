"""Tests associated with myreports helpers."""

import csv
import json
from cStringIO import StringIO

from myjobs.tests.factories import UserFactory
from seo.tests.factories import CompanyUserFactory
from mypartners.tests.factories import ContactRecordFactory, TagFactory
from mypartners.models import ContactRecord
from myreports.tests.test_views import MyReportsTestCase
from myreports import helpers
from myreports.helpers import determine_user_type


class TestHelpers(MyReportsTestCase):
    def setUp(self):
        super(TestHelpers, self).setUp()

        tags = [TagFactory(name=name, company=self.company) for name in [
            'test', 'stuff', 'working']]

        # Returns a list rather than a QuerySet, which is what the helper
        # functions use, so saving this to a variable isn't really helpful
        ContactRecordFactory.create_batch(
            10, partner=self.partner, contact__name='Joe Shmoe', tags=tags)
        self.records = ContactRecord.objects.all()

    def test_serialize_python(self):
        """
        Test that serializing a `QuerySet` into a Python object creates the
        correct number of `dict`s.
        """

        data = helpers.serialize('python', self.records)

        self.assertEqual(len(data), self.records.count())

    def test_serialize_values(self):
        """
        Test that if the `values` parameter is specified, column
        inclusion/exclusion as well as column ordering is respected.
        """

        # by default, all fields except pk should be inclued, and columns
        # should be sorted alphabetically
        data = helpers.serialize('python', self.records)
        values = data[-1].keys()

        self.assertEqual(data[0].keys(), sorted(values))

        # when values are specified, output records should respec the nubmer
        # and order of fields specified
        values = ['contact', 'contact_email', 'tags']
        data = helpers.serialize('python', self.records, values=values)

        self.assertEqual(data[0].keys(), values)

    def test_serialize_order_by(self):
        """
        Test that if the `order_by` parameter is specified, records are ordered
        by that parameter's value.
        """

        data = helpers.serialize(
            'python', self.records, order_by='-date_time')

        datetimes = [record['date_time'] for record in data]
        # make sure the earliest time is first
        self.assertTrue(max(datetimes) == datetimes[0])
        # make sure that the latest time is last
        self.assertTrue(min(datetimes) == datetimes[-1])

    def test_serialize_strip_html(self):
        """
        Test that HTML is properly stripped from fields when being serialized.
        """

        # Only adding notes to one recod so that we can test that empty notes
        # are parsed correctly as well
        record = self.records[0]
        record.notes = """
        <div class="tip-content">
            Saved Search Notification<br />
            <a href="https://secure.my.jobs">My.jobs</a>
            <p>Saved search was created on your behalf</p>
        </div>
        """
        record.save()

        data = helpers.serialize('python', self.records)

        for record in data:
            text = ''.join(str(value) for value in record.values())
            self.assertTrue('<' not in text, text)
            self.assertTrue('>' not in text, text)

    def test_serialize_json(self):
        """
        Test that serializing to JSON creates the correct number of
        objects.
        """

        # JSON is returned as a string, but deserializing it after serializing
        # it should create a list of dicts comparable to the number of records
        # that actually exist.
        data = json.loads(helpers.serialize('json', self.records))

        self.assertEqual(len(data), self.records.count())

    def test_serialize_csv(self):
        """Test that serializing to CSV creates the correct number of rows."""

        data = StringIO(helpers.serialize('csv', self.records))
        reader = csv.reader(data, delimiter=',')

        self.assertEqual(len(list(reader)) - 1, self.records.count())

    def test_humanize(self):
        """Test that fields get converted to human-readable equivalents."""

        data = helpers.humanize(helpers.serialize('python', self.records))

        for record in data:
            # ensure tags were converted
            self.assertEqual(record['tags'], 'test, stuff, working')

            # ensure communication type was converted
            self.assertTrue(record['contact_type'] == 'Email')


class TestUserType(MyReportsTestCase):
    """Test the usertype determination end to end."""
    def test_none(self):
        """No user at all."""
        self.assert_user_type(None, None)

    def test_jobseeker(self):
        """User object exists but has no relevant privileges."""
        user = UserFactory.create()
        self.assert_user_type(None, user)

    def test_employer(self):
        """User is an employer."""
        cuser = CompanyUserFactory.create()
        user = cuser.user
        self.assert_user_type('EMPLOYER', user)

    def test_staff(self):
        """User is staff."""
        user = UserFactory.create()
        user.is_staff = True
        self.assert_user_type('STAFF', user)

    def test_both(self):
        """User is both employer and staff."""
        cuser = CompanyUserFactory.create()
        user = cuser.user
        user.is_staff = True
        self.assert_user_type('EMPLOYER', user)

    def assert_user_type(self, expected, user):
        """Handle details of determining and checking user_type."""
        self.assertEqual(expected,
                         determine_user_type(user))
