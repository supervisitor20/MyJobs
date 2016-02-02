from abc import ABCMeta, abstractmethod


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
    def run(self, data_type, company, filter_spec, order_spec):
        """Run the query with the given company, filter, and ordering.

        data_type: data_type variant to run; i.e. unaggregated, per_year
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
