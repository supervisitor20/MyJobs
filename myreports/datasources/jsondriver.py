import json
from datetime import datetime


class DataSourceJsonDriver(object):
    def __init__(self, ds):
        self.ds = ds

    def run(self, company, filter_spec, order_spec):
        """Run the report.

        company: company model object for this run.
        filter_spec: string with json object representing the user filter
        order_spec: string with json list of fields in "[+-]field" form

        returns: list of relatively flat dictionaries.
        """
        return self.ds.run(
            company,
            self.build_filter(filter_spec),
            self.build_order(order_spec))

    def help(self, company, filter_spec, field, partial):
        """Get help values for a particular field.

        company: company model object for this run.
        filter_spec: string with json object for the current user filter.
        field: which field we are getting help for
        partial: the user input in the field so far
        """
        filter_obj = self.build_filter(filter_spec)
        return self.ds.help(company, filter_obj, field, partial)

    def build_order(self, order_spec):
        """Build a list of order_by fields from the given order_spec."""
        return json.loads(order_spec)

    def build_filter(self, filter_json):
        """Build a filter for the given filter_json"""
        kwargs = {}
        filter_spec = json.loads(filter_json)

        filter_type = self.ds.filter_type()
        types = filter_type.filter_key_types()
        for key, data in filter_spec.iteritems():
            key_type = types.get(key, None)
            if key_type is None:
                kwargs[key] = data
            elif key_type == 'date_range':
                date_strings = filter_spec.get(key, None)
                dates = [
                    (datetime.strptime(d, "%Y-%m-%d") if d else None)
                    for d in date_strings]

                kwargs[key] = dates
            else:
                message = 'DataSource %s has unknown filter key type %s' % (
                    self.ds.__class__.__name__,
                    repr(key_type))
                raise KeyError(message)

        return filter_type(**kwargs)

    def encode_filter_interface(self, report_configuration):
        """Describe the filter_interface in python primitives.

        Output is suitable for serializing to JSON.
        """
        column_configs = report_configuration.columns
        filters = [
            self.encode_single_filter_interface(c)
            for c in column_configs
            if c.filter_interface is not None
        ]

        help_available = dict(
            (c.column, True)
            for c in column_configs
            if c.help)

        return {
            'filters': filters,
            'help': help_available,
        }

    def encode_single_filter_interface(self, column_config):
        return {
            'interface_type': column_config.filter_interface,
            'filter': column_config.column,
            'display': column_config.filter_display
        }
