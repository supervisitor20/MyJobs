from unittest import TestCase

from datetime import datetime

from myreports.datasources.util import filter_date_range


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
