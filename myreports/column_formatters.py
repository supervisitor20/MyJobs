"""Format utilities for translating from saved report json to text."""
from collections import Iterable, Mapping


def string_formatter(value):
    """Take the given (usually text) value and format it as unicode text."""
    if value is None:
        return ''

    return unicode(value)


def join_formatter(between, inner_formatter=None):
    """
    Format an iterable value by joining it.

    between: a string to place between the items.
    inner_formatter: how to format the items themselves.

    """
    inner_formatter = inner_formatter or string_formatter

    def formatter(values):
        if isinstance(values, Iterable) and not isinstance(values, basestring):
            return between.join(inner_formatter(v) for v in values)
        else:
            # Fail somewhat gracefully if we set things up wrong.
            return inner_formatter(values)

    return formatter


def strftime_formatter(strftime_format):
    """
    Format a value which supports strftime.

    strftime_format: format to use, i.e. %Y-%m-%d

    """

    def formatter(value):
        if value is None:
            return ''
        else:
            return value.strftime(strftime_format)

    return formatter


def multi_field_descend_formatter(fields, inner):
    """
    Format a value which supports __getitem__.

    fields: ordered list of keys we are interested in
    inner: formatter used to format the items themselves.

    """
    def formatter(value):
        if value is None:
            return []
        elif isinstance(value, Mapping):
            return inner(value.get(f, None) for f in fields)
        else:
            return inner([value])

    return formatter


def single_field_descend_formatter(field, inner):
    """Format a single item from a value which supports __getitem__."""

    def formatter(value):
        if value is None:
            return ''
        elif isinstance(value, Mapping):
            return value.get(field, None)
        else:
            return inner(value)

    return formatter


# Dictionary of codes used in the db to name useful formatters.
COLUMN_FORMATTERS = {
    'text': string_formatter,
    'comma_sep': join_formatter(', ', string_formatter),
    'us_date': strftime_formatter('%s/%02d/%Y'),
    'city_state_list': join_formatter(
        ', ',
        multi_field_descend_formatter(
            ['city', 'state'],
            join_formatter(', ', string_formatter))),
    'tags_list': join_formatter(
        ', ', single_field_descend_formatter(
            'name', string_formatter)),
}
