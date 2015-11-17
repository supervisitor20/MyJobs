from myreports.column_formats import COLUMN_FORMATS


class ReportConfiguration(object):
    def __init__(self, columns, filter_interface):
        self.columns = columns
        self.filter_interface = filter_interface

    def get_header(self):
        return [c.column for c in self.columns]

    def format_record(self, raw_data):
        return dict(
            (c.column, c.extract_formatted(raw_data))
            for c in self.columns)


class ColumnConfiguration(object):
    def __init__(self, column, format):
        self.column = column
        self.format = COLUMN_FORMATS[format]

    def extract_formatted(self, data):
        return self.format.format(data[self.column])


class FilterInterfaceConfiguration(object):
    def __init__(self, filter=None, filters=None, type=None, help=False,
                 display=''):
        self.filter = filter
        self.filters = filters
        self.type = type
        self.display = display
        self.help = help
