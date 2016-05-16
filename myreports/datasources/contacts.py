"""Contacts DataSource"""
from operator import __or__
from datetime import datetime

from myreports.datasources.util import (
    dispatch_help_by_field_name, dispatch_run_by_data_type,
    filter_date_range, extract_tags)
from myreports.datasources.base import DataSource, DataSourceFilter

from mypartners.models import Contact, Location, Tag, Partner, Status

from universal.helpers import dict_identity, extract_value

from django.db.models import Q


class ContactsDataSource(DataSource):
    def run(self, data_type, company, filter_spec, order):
        return dispatch_run_by_data_type(
            self, data_type, company, filter_spec, order)

    def run_unaggregated(self, company, filter_spec, order):
        """Run the query with the given company, filter, and ordering.

        returns: list of relatively flat dictionaries.

        The dictionaries have depth only for locations and tags. This is to
        allow for some flexibility in formatting at report download time.
        """
        qs_filtered = self.filtered_query_set(company, filter_spec)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def filter_type(self):
        return ContactsFilter

    def help(self, company, filter_spec, field, partial):
        return dispatch_help_by_field_name(
            self, company, filter_spec, field, partial)

    def help_city(self, company, filter_spec, partial):
        """Get help for the city field."""
        modified_filter_spec = filter_spec.clone_without_city()
        contacts_qs = self.filtered_query_set(company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__in=contacts_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'value': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter_spec, partial):
        """Get help for the state field."""
        modified_filter_spec = filter_spec.clone_without_state()
        contacts_qs = self.filtered_query_set(company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__in=contacts_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'value': s['state'], 'display': s['state']} for s in state_qs]

    def help_tags(self, company, filter_spec, partial):
        """Get help for the tags field."""
        contacts_qs = self.filtered_query_set(company, ContactsFilter())
        tags_qs = (
            Tag.objects
            .filter(contact__in=contacts_qs)
            .filter(name__icontains=partial)
            .values('name', 'hex_color').distinct())
        return [
            {
                'value': t['name'],
                'display': t['name'],
                'hexColor': t['hex_color'],
            } for t in tags_qs]

    def help_partner(self, company, filter_spec, partial):
        """Get help for the partner field."""
        modified_filter_spec = filter_spec.clone_without_partner()
        contacts_qs = self.filtered_query_set(company, modified_filter_spec)
        partners_qs = (
            Partner.objects
            .filter(contact__in=contacts_qs)
            .filter(name__icontains=partial)
            .values('name', 'pk').distinct())
        return [{'value': t['pk'], 'display':t['name']} for t in partners_qs]

    def extract_record(self, record):
        """Translate from a query set record to a dictionary."""
        return {
            'name': record.name,
            'partner': extract_value(record, 'partner', 'name'),
            'email': record.email,
            'phone': record.phone,
            'notes': record.notes,
            'locations': [
                {'city': l.city, 'state': l.state}
                for l in record.locations.all()
            ],
            'date': record.last_action_time,
            'tags': extract_tags(record.tags.all()),
        }

    def filtered_query_set(self, company, filter_spec):
        """Create a query set with security, safety, and user filters applied.
        """
        qs_company = Contact.objects.filter(partner__owner=company)
        qs_live = (
            qs_company
            .filter(approval_status__code__iexact=Status.APPROVED)
            .filter(partner__approval_status__code__iexact=Status.APPROVED)
            .filter(archived_on__isnull=True))
        qs_filtered = filter_spec.filter_query_set(qs_live)
        return qs_filtered

    def adorn_filter(self, company, filter_spec):
        adorned = {}
        empty = ContactsFilter()

        if filter_spec.date:
            adorned[u'date'] = filter_spec.date

        if filter_spec.locations:
            adorned[u'locations'] = {}
            known_city = filter_spec.locations.get('city', None)
            if known_city:
                cities = self.help_city(company, empty, known_city)
                if cities:
                    adorned[u'locations'][u'city'] = cities[0]['value']
            known_state = filter_spec.locations.get('state', None)
            if known_state:
                states = self.help_state(company, empty, known_state)
                if states:
                    adorned[u'locations'][u'state'] = states[0]['value']

        if filter_spec.tags:
            adorned[u'tags'] = []
            for known_or_tags in filter_spec.tags:
                or_group = []

                for known_tag in known_or_tags:
                    tags = self.help_tags(company, empty, known_tag)
                    if tags:
                        or_group.append(tags[0])

                if or_group:
                    adorned[u'tags'].append(or_group)

        if filter_spec.partner:
            partners_qs = (
                Partner.objects
                .filter(owner=company)
                .filter(pk__in=filter_spec.partner)
                .values('name', 'pk').distinct())
            adorned[u'partner'] = [
                {'value': p['pk'], 'display': p['name']}
                for p in partners_qs
            ]

        return adorned

    def get_default_filter(self, data_type, company):
        filter_spec = ContactsFilter(
            date=[datetime(2014, 1, 1), datetime.now()])
        adorned = self.adorn_filter(company, filter_spec)
        return adorned


@dict_identity
class ContactsFilter(DataSourceFilter):
    """Represent a ContactsDataSource user filter."""
    def __init__(self, date=None, locations=None, tags=None, partner=None):
        self.date = date
        self.locations = locations
        self.tags = tags
        self.partner = partner

    @classmethod
    def filter_key_types(self):
        return {
            'date': 'date_range',
        }

    def clone_without_city(self):
        """City help needs it's filter cleared before searching for help.

        Return a new ContactsFilter without the current city filter applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'city' in locations:
                del new_locations['city']
            new_root['locations'] = new_locations
        return ContactsFilter(**new_root)

    def clone_without_state(self):
        """State help needs it's filter cleared before searching for help.

        Return a new ContactsFilter without the current state filter applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'state' in locations:
                del new_locations['state']
            new_root['locations'] = new_locations
        return ContactsFilter(**new_root)

    def clone_without_partner(self):
        """Partner help should not self filter."""
        new_root = dict(self.__dict__)
        del new_root['partner']
        return ContactsFilter(**new_root)

    def filter_query_set(self, qs):
        """Apply the filter described by this instance to a query set.

        qs: the query set to receive the filter
        """
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

        if self.partner:
            qs = qs.filter(partner__pk__in=self.partner)

        if self.locations is not None:
            city = self.locations.get('city', None)
            if city:
                qs = qs.filter(locations__city__iexact=city)

            state = self.locations.get('state', None)
            if state:
                qs = qs.filter(locations__state__iexact=state)

        return qs
