"""Reprsent a report configuration for data formatting and user interface."""
from universal.helpers import dict_identity

from myreports.column_formats import COLUMN_FORMATS


@dict_identity
class ReportConfiguration(object):
    """Represent the complete configuration for the report.

    1-1 relationship with the django model myreports.Configuration

    columns: list of ColumnConfiguration
    """
    def __init__(self, columns):
        self.columns = columns

    def get_header(self):
        """Return a list of column names which will appear in the report."""
        return [c.column for c in self.columns]

    def format_record(self, raw_data):
        """Return a flat fully formatted dictionary of report data."""
        return dict(
            (c.column, c.extract_formatted(raw_data))
            for c in self.columns)


@dict_identity
class ColumnConfiguration(object):
    """Represent the complete configuration for a single column.

    column: column name in the report
    format: formatter code to use for the value. see COLUMN_FORMATS
    filter_interface: code to describe the kind user interface for filtering
        can be None if this column does not support this.
    filter_display: name to display alongside the filter_interface
    help: boolean, is help available for this column?
    """
    def __init__(self, column, format,
                 filter_interface=None, filter_display=None, help=False):
        self.column = column
        self.format = COLUMN_FORMATS[format]
        self.filter_interface = filter_interface
        self.filter_display = filter_display
        self.help = help

    def extract_formatted(self, data):
        """Return a fully formatted value."""
        return self.format.format(data[self.column])
