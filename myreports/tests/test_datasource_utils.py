import json
from unittest import TestCase

from datetime import datetime
from django.db.models import Q

from myreports.report_configuration import (
     ReportConfiguration, ColumnConfiguration)
from myreports.datasources.util import (
    DateRangeFilter, MatchFilter, OrGroupFilter, AndGroupFilter, NoFilter,
    CompositeAndFilter, UnlinkedFilter,
    apply_filter_to_queryset, adorn_filter, plain_filter,
    dispatch_help_by_field_name, dispatch_run_by_data_type,
    extract_tags)
from myreports.datasources.base import DataSource
from myreports.datasources.jsondriver import DataSourceJsonDriver
from myreports.datasources.contacts import ContactsFilter
from myreports.datasources.partners import PartnersFilter


class MockQuerySet(object):
    def __init__(self, filters=[], data=[]):
        self.filters = filters
        self.data = data

    def filter(self, arg=None, **kwargs):
        qs = self
        if not arg and not kwargs:
            qs = MockQuerySet(filters=qs.filters + [None])
        if arg:
            qs = MockQuerySet(filters=qs.filters + [arg])
        if kwargs:
            qs = MockQuerySet(filters=qs.filters + [kwargs])

        return qs

    def all(self):
        return self.data


class MockTag(object):
    def __init__(self, pk, name, hex_color):
        self.id = pk
        self.name = name
        self.hex_color = hex_color


class MockCursor(object):
    def __init__(self, description, data):
        self.description = [(name,) for name in description]
        self.data = data

    def __iter__(self):
        return iter(self.data)


class TestUtils(TestCase):
    def extract_q(self, q):
        if q.__class__ == Q:
            return (q.connector, [self.extract_q(c) for c in q.children])
        return q

    def assert_q_equals(self, expected, actual):
        self.assertEquals(
            self.extract_q(expected), self.extract_q(actual),
            "Expected %s to equal %s" % (expected, actual))

    def assert_filters_equals(self, expected, actual):
        self.assertEquals(
            [self.extract_q(q) for q in expected],
            [self.extract_q(q) for q in actual])

    def test_date_range(self):
        """Test date ranges

        The range end should have an extra day added.
        """
        filt = DateRangeFilter(
            [datetime(2009, 12, 1), datetime(2009, 12, 2)])
        self.assert_q_equals(
            Q(zz__range=(datetime(2009, 12, 1), datetime(2009, 12, 3))),
            filt.as_q('zz'))

    def test_date_before(self):
        """Test date's before given."""
        filt = DateRangeFilter([None, datetime(2009, 12, 2)])
        self.assert_q_equals(
            Q(zz__lte=datetime(2009, 12, 3)),
            filt.as_q('zz'))

    def test_date_after(self):
        """Test date's after given."""
        filt = DateRangeFilter([datetime(2009, 12, 1), None])
        self.assert_q_equals(
            Q(zz__gte=datetime(2009, 12, 1)),
            filt.as_q('zz'))

    def test_daterange_none(self):
        filt = DateRangeFilter(None)
        self.assertEqual(None, filt.as_q('zz'))

    def test_match_filter(self):
        filt = MatchFilter('yy')
        self.assert_q_equals(Q(zz='yy'), filt.as_q('zz'))

    def test_match_none(self):
        filt = MatchFilter(None)
        self.assert_q_equals(None, filt.as_q('zz'))

    def test_no_filter(self):
        self.assertEqual(False, bool(NoFilter()))
        self.assertEqual(None, NoFilter().as_q(None))

    def test_or_group(self):
        filt = OrGroupFilter([MatchFilter('a'), MatchFilter('b')])
        result = filt.as_q('zz')
        self.assert_q_equals(Q(zz='a') | Q(zz='b'), result)

    def test_or_group_empty(self):
        filt = OrGroupFilter([])
        result = filt.as_q('zz')
        self.assertEqual(None, result)

    def test_and_group(self):
        qs = MockQuerySet()
        result = apply_filter_to_queryset(
            qs,
            AndGroupFilter([
                OrGroupFilter([MatchFilter('f')]),
                OrGroupFilter([
                    MatchFilter('g'),
                    MatchFilter('h')]),
                MatchFilter('i')]),
            'z')
        self.assert_filters_equals([
            Q(z='f'),
            Q(z='g') | Q(z='h'),
            Q(z='i'),
            ], result.filters)

    def test_and_group_empty(self):
        qs = MockQuerySet()
        result = apply_filter_to_queryset(qs, AndGroupFilter([]), 'z')
        self.assert_filters_equals([], result.filters)

    def test_composite_and_group(self):
        filt = CompositeAndFilter({
            'a': MatchFilter('b'),
            'c': OrGroupFilter([MatchFilter('d'), MatchFilter('e')])})
        result = filt.as_q({'a': 'aaa', 'c': 'ccc'})
        self.assert_q_equals(
            Q(aaa='b') & (Q(ccc='d') | Q(ccc='e')),
            result)

    def test_composite_and_group_none(self):
        filt = CompositeAndFilter({
            'a': MatchFilter('b'),
            'c': NoFilter()})
        result = filt.as_q({'a': 'aaa', 'c': 'ccc'})
        self.assert_q_equals(
            Q(aaa='b'),
            result)

    def test_composite_and_group_empty(self):
        filt = CompositeAndFilter({})
        self.assertEquals(None, filt.as_q(None))

    def test_composite_and_group_missing_db_field(self):
        filt = CompositeAndFilter({
            'a': MatchFilter('b'),
            'c': NoFilter()})
        self.assert_q_equals(Q(aaa='b'), filt.as_q({'a': 'aaa', 'b': 'bbb'}))
        self.assertEquals(None, filt.as_q({'b': 'bbb'}))

    def test_unlinked(self):
        qs = MockQuerySet()
        result = apply_filter_to_queryset(qs, UnlinkedFilter(), 'z')
        self.assert_filters_equals([{'z': None}], result.filters)

    def test_apply_filters(self):
        qs = MockQuerySet()

        result = apply_filter_to_queryset(qs, NoFilter(), 'z')
        self.assert_filters_equals([], result.filters)

        result = apply_filter_to_queryset(qs, MatchFilter('b'), 'a')
        self.assert_filters_equals([Q(a='b')], result.filters)

        result = apply_filter_to_queryset(qs, OrGroupFilter([]), 'z')
        self.assert_filters_equals([], result.filters)

        result = apply_filter_to_queryset(
            qs,
            OrGroupFilter([MatchFilter('c'), MatchFilter('d')]),
            'z')
        self.assert_filters_equals([Q(z='c') | Q(z='d')], result.filters)

    def test_extract_tag_list(self):
        """Should grab only the names from the list."""
        tag_list = [
            MockTag(1, 'TagA', '#aaaaaa'),
            MockTag(2, 'TagB', '#bbbbbb'),
        ]

        result = extract_tags(MockQuerySet(data=tag_list))

        expected = [
            {'id': 1, 'name': 'TagA', 'hex_color': '#aaaaaa'},
            {'id': 2, 'name': 'TagB', 'hex_color': '#bbbbbb'},
        ]
        self.assertEqual(expected, result)

    def test_plain_filter_match(self):
        filt = PartnersFilter(uri=MatchFilter('www'))
        self.assertEqual({
            'uri': 'www',
        }, plain_filter(filt))

    def test_plain_filter_or(self):
        filt = ContactsFilter(
            partner=OrGroupFilter([
                MatchFilter(1),
                MatchFilter(2),
            ]))
        self.assertEqual({'partner': [1, 2]}, plain_filter(filt))

    def test_plain_filter_and(self):
        filt = ContactsFilter(
            tags=AndGroupFilter([
                OrGroupFilter([
                    MatchFilter(1),
                    MatchFilter(2),
                ]),
                OrGroupFilter([
                    MatchFilter(3),
                    MatchFilter(4),
                ])]))
        self.assertEqual({'tags': [[1, 2], [3, 4]]}, plain_filter(filt))

    def test_plain_filter_composite_and(self):
        filt = ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter('indy'),
                'state': MatchFilter('IN'),
            }))
        self.assertEqual({
            'locations': {
                'city': 'indy',
                'state': 'IN',
            },
        }, plain_filter(filt))

    def test__plain_filter_composite_date_range(self):
        filt = ContactsFilter(
            date=DateRangeFilter([
                datetime(2015, 9, 1),
                datetime(2015, 9, 30)]))
        self.assertEqual({
            'date': [datetime(2015, 9, 1), datetime(2015, 9, 30)],
        }, plain_filter(filt))

    def test_plain_filter_unlinked(self):
        filt = ContactsFilter(tags=UnlinkedFilter())
        self.assertEqual({
            'tags': {'nolink': True},
        }, plain_filter(filt))


class MockDataSource(DataSource):
    def __init__(self):
        self.calls = []
        self.adorn_calls = []

    def filter_type(self):
        return ContactsFilter

    def help(self, company, filter, field, partial):
        self.calls.append(['help', company, filter, field, partial])
        return 'aaa'

    def run(self, data_source, company, filter, order):
        self.calls.append(['run', data_source, company, filter, order])
        return 'aaa'

    def adorn_filter_items(self, company, filter_items):
        self.adorn_calls.append(filter_items)
        return {
            'locations': {
                'city': {
                    'indy': {'value': 'indy', 'display': 'Indy'},
                },
                'state': {
                    'IN': {'value': 'IN', 'display': 'Indiana'},
                },
            },
            'tags': {
                'a': {'value': 'a', 'display': 'A', 'hexcolor': 'aaaaaa'},
                'b': {'value': 'b', 'display': 'B', 'hexcolor': 'bbbbbb'},
            },
        }

    def get_default_filter(self, data_type, company):
        pass


class TestAdornFilter(TestCase):
    def setUp(self):
        super(TestAdornFilter, self).setUp()
        self.ds = MockDataSource()

    def test_passthrough_missing(self):
        result = adorn_filter(None, self.ds, ContactsFilter(
            partner=OrGroupFilter([
                MatchFilter(1),
                MatchFilter(2)])))
        self.assertEqual([{
            'partner': [1, 2],
        }], self.ds.adorn_calls)
        self.assertEqual(
            ContactsFilter(partner=OrGroupFilter([
                MatchFilter(1),
                MatchFilter(2)])), result)

    def test_passthrough_missing_composite_and(self):
        result = adorn_filter(None, self.ds, ContactsFilter(
            partner=CompositeAndFilter({
                'a': MatchFilter(1),
                'b': MatchFilter(2)
            })))
        self.assertEqual([{
            'partner': {'a': [1], 'b': [2]},
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            partner=CompositeAndFilter({
                'a': MatchFilter(1),
                'b': MatchFilter(2)
            })), result)

    def test_match(self):
        result = adorn_filter(None, self.ds, ContactsFilter(
            date=MatchFilter('dt'),
            tags=MatchFilter('a')))
        self.assertEqual([{
            'date': ['dt'],
            'tags': ['a'],
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            date=MatchFilter('dt'),
            tags=MatchFilter(
                {'value': 'a', 'display': 'A', 'hexcolor': 'aaaaaa'})), result)

    def test_or_group(self):
        self.maxDiff = 10000
        result = adorn_filter(None, self.ds, ContactsFilter(
            tags=OrGroupFilter([
                MatchFilter('a'),
                MatchFilter('b'),
                MatchFilter('c'),
            ])))
        self.assertEqual([{
            'tags': ['a', 'b', 'c'],
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            tags=OrGroupFilter([
                MatchFilter(
                    {'value': 'a', 'display': 'A', 'hexcolor': 'aaaaaa'}),
                MatchFilter(
                    {'value': 'b', 'display': 'B', 'hexcolor': 'bbbbbb'}),
                MatchFilter('c'),
            ])), result)

    def test_and_group(self):
        self.maxDiff = 10000
        result = adorn_filter(None, self.ds, ContactsFilter(
            tags=AndGroupFilter([
                OrGroupFilter([
                    MatchFilter('a'),
                    MatchFilter('c'),
                ]),
                OrGroupFilter([
                    MatchFilter('b'),
                    MatchFilter('d'),
                ]),
            ])))
        self.assertEqual([{
            'tags': ['a', 'c', 'b', 'd'],
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            tags=AndGroupFilter([
                OrGroupFilter([
                    MatchFilter(
                        {'value': 'a', 'display': 'A', 'hexcolor': 'aaaaaa'}),
                    MatchFilter('c')]),
                OrGroupFilter([
                    MatchFilter(
                        {'value': 'b', 'display': 'B', 'hexcolor': 'bbbbbb'}),
                    MatchFilter('d')])])), result)

    def test_composite_and(self):
        self.maxDiff = 10000
        result = adorn_filter(None, self.ds, ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter('indy'),
                'state': MatchFilter('IN'),
            })))
        self.assertEqual([{
            'locations': {
                'city': ['indy'],
                'state': ['IN'],
            },
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter({'value': 'indy', 'display': 'Indy'}),
                'state': MatchFilter({'value': 'IN', 'display': 'Indiana'}),
            })), result)

    def test_composite_and_missing_in_db(self):
        self.maxDiff = 10000
        result = adorn_filter(None, self.ds, ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter('indy'),
                'state': MatchFilter('IN'),
                'county': MatchFilter('marion'),
            })))
        self.assertEqual([{
            'locations': {
                'city': ['indy'],
                'state': ['IN'],
                'county': ['marion'],
            },
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter({'value': 'indy', 'display': 'Indy'}),
                'state': MatchFilter({'value': 'IN', 'display': 'Indiana'}),
                'county': MatchFilter('marion'),
            })), result)

    def test_composite_and_partial_filter(self):
        self.maxDiff = 10000
        result = adorn_filter(None, self.ds, ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter('indy'),
            })))
        self.assertEqual([{
            'locations': {
                'city': ['indy'],
            },
        }], self.ds.adorn_calls)
        self.assertEqual(ContactsFilter(
            locations=CompositeAndFilter({
                'city': MatchFilter({'value': 'indy', 'display': 'Indy'}),
            })), result)


class TestDataSourceJsonDriver(TestCase):
    def setUp(self):
        super(TestDataSourceJsonDriver, self).setUp()
        self.ds = MockDataSource()
        self.driver = DataSourceJsonDriver(self.ds)

    def test_encode_filter_interface(self):
        """Test that filter interface is serialized properly."""
        self.maxDiff = 10000
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

    def test_help(self):
        """Test that city help gets plumbed to datasource correctly."""
        result = self.driver.help('company', '{}', 'city', 'zzz')
        self.assertEqual('aaa', result)
        self.assertEqual([
            ['help', 'company', ContactsFilter(), 'city', 'zzz']
            ], self.ds.calls)

    def test_run(self):
        """Test that json run calls are plumbed to datasource correctly."""
        result = self.driver.run('unaggregated', 'company', '{}', '["zzz"]')
        self.assertEqual('aaa', result)
        self.assertEqual([
            ['run', 'unaggregated', 'company', ContactsFilter(), ['zzz']]
            ], self.ds.calls)

    def test_empty_filter(self):
        """Test that ContactsFilter has all proper defaults."""
        result = self.driver.build_filter("{}")
        self.assertEquals(ContactsFilter(), result)

    def test_tag_filter(self):
        """Test that tag filter is built properly."""
        result = self.driver.build_filter(
                '{"tags": [[1, 2], [3, 4]]}')
        self.assertEquals(ContactsFilter(
            tags=AndGroupFilter([
                OrGroupFilter([MatchFilter(1), MatchFilter(2)]),
                OrGroupFilter([MatchFilter(3), MatchFilter(4)]),
            ])), result)

    def test_city_filter(self):
        """Test that city filter is built properly."""
        result = self.driver.build_filter(
                '{"locations": {"city": "Indy"}}')
        self.assertEquals(
            ContactsFilter(
                locations=CompositeAndFilter({
                    'city': MatchFilter('Indy')})), result)

    def test_partner_filter(self):
        """Test that partner filter is built properly."""
        result = self.driver.build_filter(
                '{"partner": [1, 2]}')
        self.assertEquals(
            ContactsFilter(
                partner=OrGroupFilter([
                    MatchFilter(1),
                    MatchFilter(2)])), result)

    def test_date_filters(self):
        """Test that date filters are built properly."""
        spec = '{"date": ["09/01/2015", "09/30/2015"]}'
        result = self.driver.build_filter(spec)
        expected = ContactsFilter(
            date=DateRangeFilter([
                datetime(2015, 9, 1),
                datetime(2015, 9, 30)]))
        self.assertEquals(expected, result)

    def test_empty_list_filters(self):
        """
        Test that an empty list is interpreted as no filter.
        """
        spec = '{"partner": [], "partner_tags": []}'
        result = self.driver.build_filter(spec)
        expected = ContactsFilter()
        self.assertEquals(expected, result)

    def test_unlinked_filters(self):
        """
        Test that we can build an unlinked filter
        """
        spec = '{"partner": {"nolink": true}}'
        result = self.driver.build_filter(spec)
        expected = ContactsFilter(partner=UnlinkedFilter())
        self.assertEquals(expected, result)

    def test_filterlike_serialize(self):
        result = self.driver.serialize_filterlike(
            [{'a': 'b'}, {'c': datetime(2016, 1, 2)}])
        expected = '[{"a": "b"}, {"c": "01/02/2016"}]'
        self.assertEquals(expected, result)


class SomeDataSource(DataSource):
    def filter_type(self):
        pass

    def run(self, data_type, company, filter_spec, order_spec):
        return dispatch_run_by_data_type(
                self, data_type, company, filter_spec, order_spec)

    def run_unaggregated(self, company, filter_spec, order_spec):
        return ['unaggregated']

    def help(self, company, filter_spec, field, partial):
        return dispatch_help_by_field_name(
                self, company, filter_spec, field, partial)

    def help_name(self, company, filter_spec, partial):
        return partial + ' zz'

    def adorn_filter_items(self, company, found_items):
        pass

    def get_default_filter(self, data_type, company):
        pass


class TestDispatch(TestCase):
    ds = SomeDataSource()

    def test_help_dispatch(self):
        self.assertEquals('aa zz', self.ds.help(None, None, 'name', 'aa'))

    def test_help_dispatch_missing_method(self):
        try:
            self.ds.help(None, None, 'zz', None)
        except AttributeError:
            pass

    def test_run_dispatch(self):
        self.assertEquals(
            ['unaggregated'],
            self.ds.run('unaggregated', None, None, None))

    def test_run_dispatch_missing_method(self):
        try:
            self.ds.run('zz', None, None, None)
        except AttributeError:
            pass
