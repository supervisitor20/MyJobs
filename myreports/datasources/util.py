from abc import ABCMeta, abstractmethod
import json
from datetime import timedelta, datetime


class DataSource:
    """A queryable datasource.

        class SomeDataSource(DataSource):
            def filter_type(self):
                return SomeFilter # See DataSourceFilter

            def run(self, company, filter_spec, order):
                ...

            def help(self, company, filter_spec, field, partial):
                ...

    Instances can run queries on behalf of users, as well as provide help
    in constructing useful filters for those queries.

    The queries are not aware of particular users. This protocol just
    requires a company to limit results.

    Classes derived from this base also require a companion filter class
    derived from DataSourceFilter.
    """
    __metaclass__ = ABCMeta

    @abstractmethod
    def filter_type(self):
        """Return the companion filter type for this class.

        The companion type should be derived from DataSourceFilter.
        """
        raise NotImplementedError(
            "Missing filter_type method on this instance.")

    @abstractmethod
    def run(self, company, filter_spec, order_spec):
        """Run the query with the given company, filter, and ordering.

        company: reference to the company for the logged in user
        filter_spec: an instance of the companion filter type for this class.
        order_spec: a list of fields to order the query.
            This list follows the same convention as Django with regard to
            specifying asending/descending order.

        returns: list of relatively flat dictionaries.

        The dictionaries have some depth at this point. This is to allow for
        some flexibility in formatting at report download time.
        """
        raise NotImplementedError("Missing run method on this instance.")

    @abstractmethod
    def help(self, company, filter_spec, field, partial):
        """Get help for the given field.

        company: reference to the company for the logged in user
        filter_spec: an instance of the companion filter type for this class.
        field: the name of the field we are getting help for.
        partial: the input given by the user so far.

        returns: list of dictionaries in the form:
            { key: 'key', display: 'Display String', ...}

        This is used to list of possible completions for given user input in
        a form useful to filter building UI.

        The UI is expected do display the display value, but provide the key
        value as part of filter_spec when running the query.
        """
        raise NotImplementedError("Missing help method on this instance.")


class DataSourceFilter:
    """A filter on a query for an DataSource, populated with values.

        class SomeFilter(DataSource):
            def __init__(
                dates,
                city):
                self.dates = dates
                self.city = city

            @classmethod
            def filter_key_types(self):
                return {'dates': 'date_range'}

            def clone_without_city(self):
                new_data = dict(self.__dict__)
                new_data['city'] = None
                return SomeFilter(**new_data)

            def filter_query_set(self, query_set):
                ...

    An instance should be handled like an immutable value. All values
    pertaining to the filter should be provided to the constructor. If a
    variation of an existing filter is needed, add "clone_*" methods to the
    derived class.

    i.e. clone_without_city(self) would return a new instance of the class
    with the city instance variable set to None.

    Derived instances should also provide a @classmethod called
    filter_key_types. This provides a signal to DataSourceJsonDriver that
    it should do extra parsing on the json data for that field.
    """
    __metaclass__ = ABCMeta

    @abstractmethod
    def filter_query_set(self, query_set):
        """Filter the given query_set.

        Use this object's instance variables to perform a meaningful filter
        of the data provided in query_set.

        The exact meaning of that filtering is an agreement between this
        class and it's companion DataSource.

        For Django models this usually means that this method receives a
        partially filtered query set (live company filter already applied)
        and this method is responsible for returning a new query_set with
        further refinement. (i.e. given city, date range, etc.)
        """
        raise NotImplementedError(
            "Missing filter_query_set method on this instance.")


def dispatch_help_by_field_name(ds, company, filter_spec, field, partial):
    """Invoke ds.help_[field] method.

    example:
        given field='city':
        return ds.help_city(company, filter_spec, partial)

    Breaks up large help methods into smaller help methods separated by field
    name.

    signatures of help_[field] should match the signature of
    DataSource.help without the field parameter.
    """
    method = getattr(ds, 'help_' + field)
    return method(company, filter_spec, partial)


def filter_arg(field, op, data):
    return {
        field + '__' + op: data
    }


def filter_date_range(dates, field, qs):
    if dates is None:
        return qs

    begin = None
    if (dates[0] is not None):
        begin = dates[0]

    end = None
    if (dates[1] is not None):
        end = dates[1] + timedelta(days=1)

    if (begin is not None and end is not None):
        qs = qs.filter(**filter_arg(field, 'range', (begin, end)))
    elif end is not None:
        qs = qs.filter(**filter_arg(field, 'lte', end))
    elif begin is not None:
        qs = qs.filter(**filter_arg(field, 'gte', begin))
    return qs


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
