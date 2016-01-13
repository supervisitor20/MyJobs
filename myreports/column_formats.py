"""Format utilities for translating from saved report json to text."""
from collections import Iterable
from universal.helpers import dict_identity


@dict_identity
class StringFormatter(object):
    """Take the given (usually text) value and format it as unicode text."""
    def format(self, value):
        if value is not None:
            return unicode(value)
        else:
            return ''


@dict_identity
class JoinFormatter(object):
    """Format an iterable value by joining it.

    between: a string to place between the items.
    inner_formatter: how to format the items themselves.
    """
    def __init__(self, between, inner_formatter=None):
        self.between = between
        if inner_formatter is None:
            self.inner_formatter = StringFormatter()
        else:
            self.inner_formatter = inner_formatter

    def format(self, values):
        if isinstance(values, Iterable) and not isinstance(values, str):
            return self.between.join(
                self.inner_formatter.format(v) for v in values)
        else:
            # Fail somewhat gracefully if we set things up wrong.
            return StringFormatter().format(values)


@dict_identity
class StrftimeFormatter(object):
    """Format a value which supports strftime.

    strftime_format: format to use, i.e. %Y-%m-%d
    """
    def __init__(self, strftime_format):
        self.strftime_format = strftime_format

    def format(self, value):
        if value is not None:
            return value.strftime(self.strftime_format)
        else:
            return ''


@dict_identity
class MultiFieldDescend(object):
    """Format a value which supports __getitem__.

    fields: ordered list of keys we are interested in
    inner: formatter used to format the items themselves.
    """
    def __init__(self, fields, inner):
        self.fields = fields
        self.inner = inner

    def format(self, value):
        if value is not None:
            return self.inner.format(
                [value.get(f, None) for f in self.fields])
        else:
            return []


"""Dictionary of codes used in the db to name useful formatters."""
COLUMN_FORMATS = {
    'text': StringFormatter(),
    'comma_sep': JoinFormatter(", ", StringFormatter()),
    'us_date': StrftimeFormatter("%m/%02d/%Y"),
    'city_state_list':
        JoinFormatter(
            ", ",
            MultiFieldDescend(
                ['city', 'state'],
                JoinFormatter(", ", StringFormatter()))),
}
