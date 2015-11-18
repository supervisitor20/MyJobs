from universal.helpers import dict_identity

from myreports.column_formats import COLUMN_FORMATS


@dict_identity
class ReportConfiguration(object):
    def __init__(self, columns):
        self.columns = columns

    def get_header(self):
        return [c.column for c in self.columns]

    def format_record(self, raw_data):
        return dict(
            (c.column, c.extract_formatted(raw_data))
            for c in self.columns)


@dict_identity
class ColumnConfiguration(object):
    def __init__(self, column, format,
                 filter_interface=None, filter_display=None, help=False):
        self.column = column
        self.format = COLUMN_FORMATS[format]
        self.filter_interface = filter_interface
        self.filter_display = filter_display
        self.help = help

    def extract_formatted(self, data):
        return self.format.format(data[self.column])
