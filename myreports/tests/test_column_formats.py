from datetime import datetime

from unittest import TestCase

from myreports.column_formats import (
    StringFormatter, JoinFormatter, StrftimeFormatter,
    MultiFieldDescend)


class NoopFormatter(object):
    def format(self, value):
        return value


class TestFormatters(TestCase):
    def test_string_format(self):
        """Test that strings values pass through."""
        self.assertEqual("a", StringFormatter().format("a"))

    def test_formatting_none(self):
        """Run None through formatters."""
        self.assertEqual("", StringFormatter().format(None))
        self.assertEqual("", JoinFormatter(',').format(None))
        self.assertEqual("", StrftimeFormatter("%m/%02d/%Y").format(None))
        self.assertEqual(
            [],
            MultiFieldDescend(
                ['a'],
                NoopFormatter())
            .format(None))

    def test_string_conversion(self):
        """Test that non string values are converted to strings."""
        self.assertEqual("3", StringFormatter().format(3))
        self.assertEqual("False", StringFormatter().format(False))

    def test_unicode(self):
        """Test that unicode values pass through without damage."""
        self.assertEqual(u'aaa \u2019',
                         StringFormatter().format(u'aaa \u2019'))

    def test_date_only_format(self):
        """Test that dates can be formatted."""
        formatter = StrftimeFormatter("%m/%02d/%Y")
        self.assertEqual(
            "12/24/2007",
            formatter.format(datetime(2007, 12, 24)))

    def test_simple_join(self):
        """Test that we can join values."""
        formatter = JoinFormatter(", ")
        self.assertEqual(
            "a, b, c",
            formatter.format(["a", "b", "c"]))

    def test_sub_join(self):
        """Test that we can compose join and other formatters."""
        formatter = JoinFormatter(", ", StrftimeFormatter("%Y"))
        self.assertEqual(
            "2007, 2008, 2009",
            formatter.format([
                datetime(2007, 12, 24),
                datetime(2008, 11, 23),
                datetime(2009, 10, 22)]))

    def test_multifield_descend(self):
        """Test that we can format dictionaries."""
        formatter = MultiFieldDescend(
            ['city', 'state'],
            NoopFormatter())

        self.assertEqual(
            ["Indy", "IN"],
            formatter.format({"city": "Indy", "state": "IN"}))

    def test_multifield_descend_missing_key(self):
        """Test that we can handle missing dictionary keys."""
        formatter = MultiFieldDescend(
            ['city', 'state'],
            NoopFormatter())

        self.assertEqual(
            ["Indy", None],
            formatter.format({"city": "Indy"}))
