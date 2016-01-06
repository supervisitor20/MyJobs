"""Partners DataSource"""
from operator import __or__

from mypartners.models import Contact, Partner, Status, Location, Tag

from myreports.datasources.util import filter_date_range

from universal.helpers import dict_identity

from django.db.models import Q


class PartnersDataSource(object):
    def run(self, company, filter, order):
        qs_filtered = self.filtered_query_set(company, filter)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def extract_record(self, record):
        return {
            'data_source': record.data_source,
            'date': record.last_action_time,
            'name': record.name,
            'primary_contact':
                self.extract_primary_contact(record.primary_contact),
            'tags': [t.name for t in record.tags.all()],
            'uri': record.uri,
        }

    def extract_primary_contact(self, contact):
        if contact is None:
            return None
        else:
            return contact.name

    def filter_type(self):
        return PartnersFilter

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

    def help_uri(self, company, filter, partial):
        """Get help for the uri field."""
        partners_qs = self.filtered_query_set(company, filter)

        uris_qs = (
            partners_qs
            .filter(uri__icontains=partial)
            .values('uri').distinct())
        return [{'key': c['uri'], 'display': c['uri']} for c in uris_qs]

    def help_data_source(self, company, filter, partial):
        """Get help for the data_source field."""
        partners_qs = self.filtered_query_set(company, filter)

        data_sources_qs = (
            partners_qs
            .filter(data_source__icontains=partial)
            .values('data_source').distinct())
        return [
            {'key': c['data_source'], 'display': c['data_source']}
            for c in data_sources_qs
        ]

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
    def __init__(self, date=None, locations=None, tags=None,
                 data_source=None, uri=None):
        self.date = date
        self.locations = locations
        self.tags = tags
        self.data_source = data_source
        self.uri = uri

    @classmethod
    def filter_key_types(self):
        return {
            'date': 'date_range',
            'data_source': 'pass',
            'locations': 'pass',
            'tags': 'pass',
            'uri': 'pass',
        }

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

        if self.data_source:
            qs = qs.filter(data_source__iexact=self.data_source)

        if self.uri:
            qs = qs.filter(uri__iexact=self.uri)

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
