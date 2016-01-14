from datetime import datetime

from unittest import TestCase

from myreports.datasources.comm_records import (
     CommRecordsDataSource, CommRecordsFilter)

from myjobs.tests.setup import MyJobsBase
from myjobs.tests.factories import UserFactory
from mydashboard.tests.factories import CompanyFactory
from mypartners.tests.factories import (
    PartnerFactory, ContactFactory, LocationFactory, TagFactory,
    ContactRecordFactory)
from mypartners.models import Status


class TestCommRecordsDataSource(MyJobsBase):
    def setUp(self):
        super(TestCommRecordsDataSource, self).setUp()

        # A company to work with
        self.company = CompanyFactory(name='right')
        self.company.save()

        # A separate company that should not show up in results.
        self.other_company = CompanyFactory(name='wrong')
        self.other_company.save()

        self.partner_a = PartnerFactory(
            owner=self.company,
            uri='http://www.example.com/',
            data_source="zap",
            name="aaa")
        self.partner_b = PartnerFactory(
            owner=self.company,
            uri='http://www.asdf.com/',
            data_source="bcd",
            name="bbb")
        # An unapproved parther. Associated data should be filtered out.
        self.partner_unapp = PartnerFactory(
            owner=self.company,
            name="unapproved",
            approval_status__code=Status.UNPROCESSED)
        # An archived parther. Associated data should be filtered out.
        self.partner_archived = PartnerFactory(owner=self.company)

        self.east_tag = TagFactory.create(name='east', hex_color="aaaaaa")
        self.west_tag = TagFactory.create(name='west', hex_color="bbbbbb")
        self.bad_tag = TagFactory.create(name='bad', hex_color="cccccc")

        self.john_user = UserFactory(email="john@user.com")
        self.john = ContactFactory(
            partner=self.partner_a,
            name='john adams',
            user=self.john_user,
            email="john@user.com",
            last_action_time='2015-10-03')
        self.john.locations.add(
            LocationFactory.create(
                city="Indianapolis",
                state="IN"))
        self.john.locations.add(
            LocationFactory.create(
                city="Chicago",
                state="IL"))

        self.sue_user = UserFactory(email="sue@user.com")
        self.sue = ContactFactory(
            partner=self.partner_b,
            name='Sue Baxter',
            user=self.sue_user,
            email="sue@user.com",
            last_action_time='2015-09-30 13:23')
        self.sue.locations.add(
            LocationFactory.create(
                address_line_one="123",
                city="Los Angeles",
                state="CA"))
        self.sue.locations.add(
            LocationFactory.create(
                address_line_one="234",
                city="Los Angeles",
                state="CA"))

        self.partner_a.primary_contact = self.john
        self.partner_b.primary_contact = self.sue

        self.partner_a.save()
        self.partner_b.save()

        self.record_1 = ContactRecordFactory(
            subject='record 1',
            date_time='2015-09-30 13:23',
            contact=self.john,
            contact_type="Email",
            partner=self.partner_a,
            location='Indianapolis, IN',
            tags=[self.east_tag])
        self.record_2 = ContactRecordFactory(
            subject='record 2',
            date_time='2015-01-01',
            contact=self.john,
            contact_type="Meeting Or Event",
            partner=self.partner_a,
            location='Indianapolis, IN',
            tags=[self.east_tag])
        self.record_3 = ContactRecordFactory(
            subject='record 3',
            date_time='2015-10-03',
            contact=self.sue,
            contact_type="Phone",
            partner=self.partner_b,
            location='Los Angeles, CA',
            tags=[self.west_tag])

        # Archive archived data here. Doing this earlier in the set up results
        # in odd exceptions.
        self.partner_archived.archive()

    def test_run_unfiltered(self):
        """Make sure we only get data for this user."""
        ds = CommRecordsDataSource()
        recs = ds.run(self.company, CommRecordsFilter(), [])
        subjects = set([r['subject'] for r in recs])
        expected = {
            self.record_1.subject,
            self.record_2.subject,
            self.record_3.subject,
        }
        self.assertEqual(expected, subjects)

    def test_filter_by_date_range(self):
        """Should show only commrec with last_action_time in range."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                date_time=[datetime(2015, 9, 1), datetime(2015, 9, 30)]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_date_before(self):
        """Should show only commrec with last_action_time before date."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                date_time=[None, datetime(2015, 9, 30)]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject, self.record_2.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_date_after(self):
        """Should show only commrec with last_action_time after date."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                date_time=[datetime(2015, 10, 1), None]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_3.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_state(self):
        """Should show only commrecs with correct state."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                locations={
                    'state': 'CA'
                }),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_3.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_city(self):
        """Should show only commrecs with correct city."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                locations={
                    'city': 'Los Angeles'
                }),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_3.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_tags(self):
        """Show only commrec with correct tags."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(tags=[['EaSt']]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject, self.record_2.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_tags_or(self):
        """Show only commrec with correct tags in 'or' configuration."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(tags=[['EaSt', 'wEsT']]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {
            self.record_1.subject,
            self.record_2.subject,
            self.record_3.subject,
        }
        self.assertEqual(expected, subjects)

    def test_filter_by_tags_and(self):
        """Show only commrec with correct tags in 'and' configuration."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(tags=[['EaSt'], ['wEsT']]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = set()
        self.assertEqual(expected, subjects)

        # Now try adding another tag.
        self.record_1.tags.add(self.west_tag)
        self.record_1.save()
        recs = ds.run(
            self.company,
            CommRecordsFilter(tags=[['EaSt'], ['wEsT']]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_empty_things(self):
        """Empty filters should not filter, just like missing filters."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(
                locations={'city': '', 'state': ''}),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {
            self.record_1.subject,
            self.record_2.subject,
            self.record_3.subject,
        }
        self.assertEqual(expected, subjects)

    def test_filter_by_communication_type(self):
        """Check communication_type filter works at all."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(communication_type='Email'),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_partner(self):
        """Check partner filter works at all."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(partner=[self.partner_a.pk]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_1.subject, self.record_2.subject}
        self.assertEqual(expected, subjects)

    def test_filter_by_contact(self):
        """Check partner filter works at all."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(contact=[self.sue.pk]),
            [])
        subjects = set([r['subject'] for r in recs])
        expected = {self.record_3.subject}
        self.assertEqual(expected, subjects)

    def test_help_city(self):
        """Check city help works and ignores current city filter."""
        ds = CommRecordsDataSource()
        recs = ds.help_city(
            self.company,
            CommRecordsFilter(locations={'city': "zz"}),
            "angel")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'Los Angeles'}, actual)

    def test_help_state(self):
        """Check state help works and ignores current state filter."""
        ds = CommRecordsDataSource()
        recs = ds.help_state(
            self.company,
            CommRecordsFilter(locations={'state': "zz"}),
            "i")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'IL', 'IN'}, actual)

    def test_help_tags(self):
        """Check tags help works at all."""
        ds = CommRecordsDataSource()
        recs = ds.help_tags(self.company, CommRecordsFilter(), "E")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'east', 'west'}, actual)

    def test_help_tags_colors(self):
        """Tags should have colors"""
        ds = CommRecordsDataSource()
        recs = ds.help_tags(self.company, CommRecordsFilter(), "east")
        self.assertEqual("aaaaaa", recs[0]['hexColor'])

    def test_help_communication_types(self):
        """Check communication_types help works at all."""
        ds = CommRecordsDataSource()
        recs = ds.help_communication_type(
            self.company, CommRecordsFilter(), "ph")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'Phone'}, actual)

    def test_help_partner(self):
        """Check partner help works at all."""
        ds = CommRecordsDataSource()
        recs = ds.help_partner(self.company, CommRecordsFilter(), "A")
        self.assertEqual(
            [{'key': self.partner_a.pk, 'display': self.partner_a.name}],
            recs)

    def test_help_contact(self):
        """Check contact help works at all."""
        ds = CommRecordsDataSource()
        recs = ds.help_contact(self.company, CommRecordsFilter(), "U")
        self.assertEqual(
            [{'key': self.sue.pk, 'display': self.sue.name}],
            recs)

    def test_order(self):
        """Check ordering results works at all."""
        ds = CommRecordsDataSource()
        recs = ds.run(
            self.company,
            CommRecordsFilter(),
            ["-subject"])
        subjects = [r['subject'] for r in recs]
        expected = [
            self.record_3.subject,
            self.record_2.subject,
            self.record_1.subject,
        ]
        self.assertEqual(expected, subjects)


class TestCommRecordsFilterCloning(TestCase):
    def test_clone_without_empty(self):
        """Cloning empty filters shouldn't crash."""
        filter = CommRecordsFilter()
        self.assertEqual(CommRecordsFilter(), filter.clone_without_city())
        self.assertEqual(CommRecordsFilter(), filter.clone_without_state())

    def test_clone_without_full(self):
        """Cloning should remove certain fields."""
        filter = CommRecordsFilter(
                tags=['C'],
                locations={'city': 'A', 'state': 'B'})
        expected_with_city = CommRecordsFilter(
                tags=['C'],
                locations={'city': 'A'})
        expected_with_state = CommRecordsFilter(
                tags=['C'],
                locations={'state': 'B'})
        self.assertEqual(expected_with_state, filter.clone_without_city())
        self.assertEqual(expected_with_city, filter.clone_without_state())
