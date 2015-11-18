from universal.helpers import dict_identity


@dict_identity
class StringFormatter(object):
    def format(self, value):
        return unicode(value)


@dict_identity
class JoinFormatter(object):
    def __init__(self, between, inner_formatter=None):
        self.between = between
        if inner_formatter is None:
            self.inner_formatter = StringFormatter()
        else:
            self.inner_formatter = inner_formatter

    def format(self, values):
        return self.between.join(
            self.inner_formatter.format(v) for v in values)


@dict_identity
class StrftimeFormatter(object):
    def __init__(self, strftime_format):
        self.strftime_format = strftime_format

    def format(self, value):
        return value.strftime(self.strftime_format)


@dict_identity
class MultiFieldDescend(object):
    def __init__(self, fields, inner):
        self.fields = fields
        self.inner = inner

    def format(self, value):
        return self.inner.format([value[f] for f in self.fields])


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
