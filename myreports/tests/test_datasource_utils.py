from unittest import TestCase

from datetime import datetime

from myreports.report_configuration import (
     ReportConfiguration, ColumnConfiguration)
from myreports.datasources.util import (
    filter_date_range, DataSourceJsonDriver)
from myreports.datasources.partners import PartnersFilter


class MockQuerySet(object):
    def __init__(self, filters=[]):
        self.filters = filters

    def filter(self, **kwargs):
        return MockQuerySet(filters=self.filters + [kwargs])


class TestUtils(TestCase):
    def test_date_range(self):
        """Test date ranges

        The range end should have an extra day added.
        """
        qs = MockQuerySet()
        result = filter_date_range(
            [datetime(2009, 12, 1), datetime(2009, 12, 2)],
            'zz', qs)
        self.assertEqual([
            {
                'zz__range': (
                    datetime(2009, 12, 1),
                    datetime(2009, 12, 3)),
            }],
            result.filters)

    def test_date_before(self):
        """Test date's before given."""
        qs = MockQuerySet()
        result = filter_date_range([None, datetime(2009, 12, 2)], 'zz', qs)
        self.assertEqual([
            {
                'zz__lte': datetime(2009, 12, 3),
            }],
            result.filters)

    def test_date_after(self):
        """Test date's after given."""
        qs = MockQuerySet()
        result = filter_date_range([datetime(2009, 12, 1), None], 'zz', qs)
        self.assertEqual([
            {
                'zz__gte': datetime(2009, 12, 1),
            }],
            result.filters)

    def test_no_date(self):
        qs = MockQuerySet()
        result = filter_date_range(None, 'zz', qs)
        self.assertEqual([], result.filters)


class MockDataSource(object):
    def __init__(self):
        self.calls = []

    def filter_type(self):
        return PartnersFilter

    def help_city(self, company, filter, partial):
        self.calls.append(['help_city', company, filter, partial])
        return 'aaa'

    def run(self, company, filter, order):
        self.calls.append(['run', company, filter, order])
        return 'aaa'


class TestDataSourceJsonDriver(TestCase):
    def setUp(self):
        super(TestDataSourceJsonDriver, self).setUp()
        self.ds = MockDataSource()
        self.driver = DataSourceJsonDriver(self.ds)

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

    def test_order(self):
        """Test that order is built properly."""
        self.assertEqual(['name'], self.driver.build_order('["name"]'))

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
