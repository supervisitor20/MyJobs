"""Partners DataSource"""
import json
from datetime import datetime
from operator import __or__

from mypartners.models import Contact, Partner, Status, Location, Tag

from myreports.datasources.util import filter_date_range

from universal.helpers import dict_identity

from django.db.models import Q


class PartnersDataSourceJsonDriver(object):
    """Translate from web api values to PartnersDataSource objects."""
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
        method = getattr(self.ds, 'help_' + field)
        return method(company, self.build_filter(filter_spec), partial)

    def build_filter(self, filter_json):
        """Build a PartnersFilter for the given filter_json"""
        kwargs = {}
        filter_spec = json.loads(filter_json)
        date_strings = filter_spec.get('date', None)
        if date_strings is not None:
            dates = [
                (datetime.strptime(d, "%Y-%m-%d") if d else None)
                for d in date_strings]

            kwargs['date'] = dates

        kwargs['locations'] = filter_spec.get('locations', None)
        kwargs['tags'] = filter_spec.get('tags', None)

        return PartnersFilter(**kwargs)
        pass

    def build_order(self, order_spec):
        """Build a list of order_by fields from the given order_spec."""
        return json.loads(order_spec)

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


class PartnersDataSource(object):
    def run(self, company, filter, order):
        qs_filtered = self.filtered_query_set(company, filter)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def extract_record(self, record):
        return {
            'dataSource': record.data_source,
            'date': record.last_action_time,
            'name': record.name,
            'primary_contact': record.primary_contact,
            'tags': [t.name for t in record.tags.all()],
            'uri': record.uri,
        }

    def help_city(self, company, filter, partial):
        """Get help for the city field."""
        modified_filter = filter.clone_without_city()
        partners_qs = self.filtered_query_set(company, modified_filter)
        locations_qs = (
            Location.objects
            .filter(contacts__partner__in=partners_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'key': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter, partial):
        """Get help for the state field."""
        modified_filter = filter.clone_without_state()
        partners_qs = self.filtered_query_set(company, modified_filter)
        locations_qs = (
            Location.objects
            .filter(contacts__partner__in=partners_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'key': c['state'], 'display': c['state']} for c in state_qs]

    def help_tags(self, company, filter, partial):
        """Get help for the tags field."""
        partners_qs = self.filtered_query_set(company, filter)

        tags_qs = (
            Tag.objects
            .filter(partner__in=partners_qs)
            .filter(name__icontains=partial))
        names_qs = tags_qs.values('name', 'hex_color').distinct()
        return [
            {
                'key': t['name'],
                'display': t['name'],
                'hexColor': t['hex_color'],
            } for t in names_qs]

    def filtered_query_set(self, company, filter):
        """Create a query set with security, safety, and user filters applied.
        """
        qs_company = Partner.objects.filter(owner=company)
        qs_live = (
            qs_company
            .filter(approval_status__code__iexact=Status.APPROVED)
            .filter(archived_on__isnull=True))
        qs_filtered = filter.filter_query_set(qs_live)
        return qs_filtered


@dict_identity
class PartnersFilter(object):
    def __init__(self, date=None, locations=None, tags=None):
        self.date = date
        self.locations = locations
        self.tags = tags

    def clone_without_city(self):
        """City help needs it's filter cleared before searching for help.

        Return a new PartnersFilter without the current city filter applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'city' in locations:
                del new_locations['city']
            new_root['locations'] = new_locations
        return PartnersFilter(**new_root)

    def clone_without_state(self):
        """State help needs it's filter cleared before searching for help.

        Return a new PartnersFilter without the current state filter applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'state' in locations:
                del new_locations['state']
            new_root['locations'] = new_locations
        return PartnersFilter(**new_root)

    def filter_query_set(self, qs):
        qs = filter_date_range(self.date, 'last_action_time', qs)

        if self.tags:
            or_qs = []
            for tag_ors in self.tags:
                or_qs.append(
                    reduce(
                        __or__,
                        map(lambda t: Q(tags__name__iexact=t), tag_ors)))
            for or_q in or_qs:
                qs = qs.filter(or_q)

        if self.locations is not None:
            contact_qs = Contact.objects.all()

            city = self.locations.get('city', None)
            if city:
                contact_qs = contact_qs.filter(locations__city__iexact=city)

            state = self.locations.get('state', None)
            if state:
                contact_qs = contact_qs.filter(locations__state__iexact=state)

            contact_qs.distinct()
            qs = qs.filter(primary_contact=contact_qs)

        return qs


# Fields:
#
# Data Source
# Last Action Time
# Name
# Primary Contact
# Tags
# Uri


# Filters:
#
# City
# State
# URL
# Source
# Tags
