from datetime import datetime

from unittest import TestCase

from myreports.datasources.partners import (
     PartnersDataSource, PartnersFilter, PartnersDataSourceJsonDriver)
from myreports.report_configuration import (
     ReportConfiguration, ColumnConfiguration)

from myjobs.tests.setup import MyJobsBase
from myjobs.tests.factories import UserFactory
from mydashboard.tests.factories import CompanyFactory
from mypartners.tests.factories import (
    PartnerFactory, ContactFactory, LocationFactory, TagFactory)
from mypartners.models import Status


class TestPartnersDataSource(MyJobsBase):
    def setUp(self):
        super(TestPartnersDataSource, self).setUp()

        # A company to work with
        self.company = CompanyFactory(name='right')
        self.company.save()

        # A separate company that should not show up in results.
        self.other_company = CompanyFactory(name='wrong')
        self.other_company.save()

        self.partner_a = PartnerFactory(
            owner=self.company,
            last_action_time='2015-09-30 13:23',
            name="aaa")
        self.partner_b = PartnerFactory(
            owner=self.company,
            last_action_time='2015-10-03',
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

        self.partner_a.tags.add(self.east_tag)
        self.partner_b.tags.add(self.west_tag)

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

        # Archive archived data here. Doing this earlier in the set up results
        # in odd exceptions.
        self.partner_archived.archive()

    def test_run_unfiltered(self):
        """Should show only appropriate data for this user."""
        ds = PartnersDataSource()
        recs = ds.run(self.company, PartnersFilter(), [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name, self.partner_b.name}
        self.assertEqual(expected, names)

    def test_filter_by_date_range(self):
        """Should show only contact with last_action_time in range."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                date=[datetime(2015, 9, 1), datetime(2015, 9, 30)]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name}
        self.assertEqual(expected, names)

    def test_filter_by_date_before(self):
        """Should show only contact with last_action_time before date."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                date=[None, datetime(2015, 9, 30)]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name}
        self.assertEqual(expected, names)

    def test_filter_by_date_after(self):
        """Should show only contact with last_action_time after date."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                date=[datetime(2015, 10, 1), None]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_b.name}
        self.assertEqual(expected, names)

    def test_filter_by_state(self):
        """Should show only contacts with correct state."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                locations={
                    'state': 'CA'
                }),
            [])
        names = [r['name'] for r in recs]
        expected = [self.partner_b.name]
        self.assertEqual(expected, names)

    def test_filter_by_city(self):
        """Should show only contacts with correct city."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                locations={
                    'city': 'Los Angeles'
                }),
            [])
        names = [r['name'] for r in recs]
        expected = [self.partner_b.name]
        self.assertEqual(expected, names)

    def test_filter_by_tags(self):
        """Should show only contact with correct tags."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(tags=[['EaSt']]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name}
        self.assertEqual(expected, names)

    def test_filter_by_tags_or(self):
        """Should show only contact with correct tags in or configuration."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(tags=[['EaSt', 'wEsT']]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name, self.partner_b.name}
        self.assertEqual(expected, names)

    def test_filter_by_tags_and(self):
        """Should show only contact with correct tags in and configuration."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(tags=[['EaSt'], ['wEsT']]),
            [])
        names = set([r['name'] for r in recs])
        expected = set()
        self.assertEqual(expected, names)

        # Now try adding another tag.
        self.partner_a.tags.add(self.west_tag)
        recs = ds.run(
            self.company,
            PartnersFilter(tags=[['EaSt'], ['wEsT']]),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name}
        self.assertEqual(expected, names)

    def test_filter_by_empty_things(self):
        """Empty filters should not filter, just like missing filters."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(
                locations={'city': '', 'state': ''}),
            [])
        names = set([r['name'] for r in recs])
        expected = {self.partner_a.name, self.partner_b.name}
        self.assertEqual(expected, names)

    def test_help_city(self):
        """Should complete city and ignore current city filter."""
        ds = PartnersDataSource()
        recs = ds.help_city(
            self.company,
            PartnersFilter(locations={'city': "zz"}),
            "angel")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'Los Angeles'}, actual)

    def test_help_state(self):
        """Should complete state and ignore current state filter."""
        ds = PartnersDataSource()
        recs = ds.help_state(
            self.company,
            PartnersFilter(locations={'state': "zz"}),
            "i")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'IL', 'IN'}, actual)

    def test_help_tags(self):
        """Should provide list of tag completions."""
        ds = PartnersDataSource()
        recs = ds.help_tags(self.company, PartnersFilter(), "E")
        actual = set([r['key'] for r in recs])
        self.assertEqual({'east', 'west'}, actual)

    def test_help_tags_colors(self):
        """Tags should have colors"""
        ds = PartnersDataSource()
        recs = ds.help_tags(self.company, PartnersFilter(), "east")
        self.assertEqual("aaaaaa", recs[0]['hexColor'])

    def test_order(self):
        """Should order results as we expect."""
        ds = PartnersDataSource()
        recs = ds.run(
            self.company,
            PartnersFilter(),
            ["-name"])
        names = [r['name'] for r in recs]
        expected = [self.partner_b.name, self.partner_a.name]
        self.assertEqual(expected, names)


class MockDataSource(object):
    def __init__(self):
        self.calls = []

    def help_city(self, company, filter, partial):
        self.calls.append(['help_city', company, filter, partial])
        return 'aaa'

    def run(self, company, filter, order):
        self.calls.append(['run', company, filter, order])
        return 'aaa'


class TestPartnersDataSourceJsonDriver(TestCase):
    def setUp(self):
        super(TestPartnersDataSourceJsonDriver, self).setUp()
        self.ds = MockDataSource()
        self.driver = PartnersDataSourceJsonDriver(self.ds)

    def test_help_cities(self):
        """Test that city help gets plumbed to datasource correctly."""
        result = self.driver.help('company', '{}', 'city', 'zzz')
        self.assertEqual('aaa', result)
        self.assertEqual([
            ['help_city', 'company', PartnersFilter(), 'zzz']
            ], self.ds.calls)

    def test_run(self):
        """Test that json run calls are plumbed to datasource correctly."""
        result = self.driver.run('company', '{}', '["zzz"]')
        self.assertEqual('aaa', result)
        self.assertEqual([
            ['run', 'company', PartnersFilter(), ['zzz']]
            ], self.ds.calls)

    def test_empty_filter(self):
        """Test that PartnersFilter has all proper defaults."""
        result = self.driver.build_filter("{}")
        self.assertEquals(PartnersFilter(), result)

    def test_city_filter(self):
        """Test that city filter is built properly."""
        result = self.driver.build_filter(
                '{"locations": {"city": "Indy"}}')
        self.assertEquals(PartnersFilter(locations={'city': 'Indy'}), result)

    def test_date_filters(self):
        """Test that date filters are built properly."""
        spec = '{"date": ["2015-09-01", "2015-09-30"]}'
        result = self.driver.build_filter(spec)
        expected = PartnersFilter(
            date=[datetime(2015, 9, 1), datetime(2015, 9, 30)])
        self.assertEquals(expected, result)

    def test_order(self):
        """Test that order is built properly."""
        self.assertEqual(['name'], self.driver.build_order('["name"]'))

    def test_encode_filter_interface(self):
        """Test that filter interface is serialized properly."""
        report_config = ReportConfiguration([
            ColumnConfiguration(
                column='name',
                format='text'),
            ColumnConfiguration(
                column='date',
                format='us_date',
                filter_interface='date_range',
                filter_display='Date'),
            ColumnConfiguration(
                column='locations',
                format='city_state_list',
                filter_interface='city_state',
                filter_display='Locations',
                help=True),
            ColumnConfiguration(
                column='tags',
                format='comma_sep',
                filter_interface='search_multiselect',
                filter_display='Tags',
                help=True),
            ColumnConfiguration(
                column='partner',
                format='text',
                filter_interface='search_multiselect',
                filter_display='Partners',
                help=True),
        ])

        self.assertEquals({
            'filters': [
                {
                    'display': 'Date',
                    'filter': 'date',
                    'interface_type': 'date_range',
                },
                {
                    'display': 'Locations',
                    'filter': 'locations',
                    'interface_type': 'city_state',
                },
                {
                    'display': 'Tags',
                    'filter': 'tags',
                    'interface_type': 'search_multiselect',
                },
                {
                    'display': 'Partners',
                    'filter': 'partner',
                    'interface_type': 'search_multiselect',
                },
            ],
            'help': {
                'partner': True,
                'tags': True,
                'locations': True,
            },
        }, self.driver.encode_filter_interface(report_config))


class TestPartnersFilterCloning(TestCase):
    def test_clone_without_empty(self):
        """Test clearing filter fields on an empty filter."""
        filter = PartnersFilter()
        self.assertEqual(PartnersFilter(), filter.clone_without_city())
        self.assertEqual(PartnersFilter(), filter.clone_without_state())

    def test_clone_without_full(self):
        """Test clearing filter fields that are populated."""
        filter = PartnersFilter(
                tags=['C'],
                locations={'city': 'A', 'state': 'B'})
        expected_with_city = PartnersFilter(
                tags=['C'],
                locations={'city': 'A'})
        expected_with_state = PartnersFilter(
                tags=['C'],
                locations={'state': 'B'})
        self.assertEqual(expected_with_state, filter.clone_without_city())
        self.assertEqual(expected_with_city, filter.clone_without_state())
