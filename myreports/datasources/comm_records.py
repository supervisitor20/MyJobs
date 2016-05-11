"""CommRecords DataSource"""
from HTMLParser import HTMLParser
from operator import __or__

from django.db.models import Q
from django.utils.html import strip_tags

from mypartners.models import (
    Contact, Status, Location, Tag, ContactRecord, Partner)

from myreports.datasources.util import (
    dispatch_help_by_field_name, dispatch_run_by_data_type,
    filter_date_range, extract_tags)
from myreports.datasources.base import DataSource, DataSourceFilter

from universal.helpers import dict_identity, extract_value
from mypartners.models import CONTACT_TYPE_CHOICES


CONTACT_TYPES = dict(CONTACT_TYPE_CHOICES)


def contact_type_help_entry(contact_type):
    value = contact_type.lower()
    display = CONTACT_TYPES[value]
    return {'value': value, 'display': display}


class CommRecordsDataSource(DataSource):
    def run(self, data_type, company, filter_spec, order):
        return dispatch_run_by_data_type(
            self, data_type, company, filter_spec, order)

    def run_unaggregated(self, company, filter_spec, order):
        qs_filtered = self.filtered_query_set(company, filter_spec)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def extract_record(self, record):
        return {
            'contact': extract_value(record, 'contact', 'name'),
            'contact_email': record.contact_email,
            'contact_phone': record.contact_phone,
            'communication_type': record.contact_type,
            'created_on': record.created_on,
            'created_by': extract_value(record, 'created_by', 'email'),
            'date_time': record.date_time,
            'job_applications': record.job_applications,
            'job_hires': record.job_hires,
            'job_id': record.job_id,
            'job_interviews': record.job_interviews,
            'last_action_time': record.last_action_time,
            'length': record.length,
            'location': record.location,
            'notes': self.normalize_html(record.notes),
            'partner': extract_value(record, 'partner', 'name'),
            'subject': record.subject,
            'tags': extract_tags(record.tags.all()),
        }

    def normalize_html(self, html):
        """Strip HTML Tags and normalize gratuitous newlines."""

        parser = HTMLParser()
        results = parser.unescape(
            '\n'.join(' '.join(line.split())
            for line in strip_tags(html).splitlines() if line))

        return '\n'.join(filter(bool, results.split('\n\n')))

    def filter_type(self):
        return CommRecordsFilter

    def help(self, company, filter_spec, field, partial):
        return dispatch_help_by_field_name(
            self, company, filter_spec, field, partial)

    def help_city(self, company, filter_spec, partial):
        """Get help for the city field."""
        modified_filter_spec = filter_spec.clone_without_city()
        comm_records_qs = self.filtered_query_set(
            company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__contactrecord__in=comm_records_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'value': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter_spec, partial):
        """Get help for the state field."""
        modified_filter_spec = filter_spec.clone_without_state()
        comm_records_qs = self.filtered_query_set(
            company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__contactrecord__in=comm_records_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'value': c['state'], 'display': c['state']} for c in state_qs]

    def help_tags(self, company, filter_spec, partial):
        """Get help for the tags field."""
        modified_filter_spec = filter_spec.clone_without_tags()
        comm_records_qs = self.filtered_query_set(
            company, modified_filter_spec)

        tags_qs = (
            Tag.objects
            .filter(contactrecord__in=comm_records_qs)
            .filter(name__icontains=partial)
            .values('name', 'hex_color').distinct())
        return [
            {
                'value': t['name'],
                'display': t['name'],
                'hexColor': t['hex_color'],
            } for t in tags_qs]

    def help_communication_type(self, company, filter_spec, partial):
        """Get help for the communication type field."""
        comm_records_qs = self.filtered_query_set(company, filter_spec)

        contact_types_qs = (
            comm_records_qs
            .filter(contact_type__icontains=partial)
            .values('contact_type').distinct())
        return [
            contact_type_help_entry(c['contact_type'])
            for c in contact_types_qs]

    def help_partner(self, company, filter_spec, partial):
        """Get help for the partner field."""
        comm_records_qs = self.filtered_query_set(company, filter_spec)
        partner_qs = (
            Partner.objects
            .filter(name__icontains=partial)
            .filter(contactrecord__in=comm_records_qs)
            .values('pk', 'name').distinct())
        return [
            {
                'value': c['pk'],
                'display': c['name'],
            } for c in partner_qs]

    def help_contact(self, company, filter_spec, partial):
        """Get help for the contact field."""
        comm_records_qs = self.filtered_query_set(company, filter_spec)
        contact_qs = (
            Contact.objects
            .filter(name__icontains=partial)
            .filter(contactrecord__in=comm_records_qs)
            .values('pk', 'name').distinct())
        return [
            {
                'value': c['pk'],
                'display': c['name'],
            } for c in contact_qs]

    def filtered_query_set(self, company, filter_spec):
        """Create a query set with security, safety, and user filters applied.
        """
        qs_company = ContactRecord.objects.filter(partner__owner=company)
        qs_live = (
            qs_company
            .filter(approval_status__code__iexact=Status.APPROVED)
            .filter(archived_on__isnull=True))
        qs_filtered = filter_spec.filter_query_set(qs_live)
        return qs_filtered

    def adorn_filter(self, company, filter_spec):
        adorned = {}
        empty = CommRecordsFilter()

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

        if filter_spec.contact:
            contacts_qs = (
                Contact.objects
                .filter(partner__owner=company)
                .filter(pk__in=filter_spec.contact)
                .values('name', 'pk').distinct())
            adorned[u'contact'] = [
                {'value': p['pk'], 'display': p['name']}
                for p in contacts_qs
            ]

        if filter_spec.communication_type:
            adorned[u'communication_type'] = [
                contact_type_help_entry(c)
                for c in filter_spec.communication_type
            ]

        return adorned


@dict_identity
class CommRecordsFilter(DataSourceFilter):
    def __init__(self, date_time=None, locations=None, tags=None,
                 communication_type=None, partner=None, contact=None):
        self.date_time = date_time
        self.locations = locations
        self.tags = tags
        self.communication_type = communication_type
        self.partner = partner
        self.contact = contact

    @classmethod
    def filter_key_types(self):
        return {
            'date_time': 'date_range',
        }

    def clone_without_city(self):
        """City help needs it's filter cleared before searching for help.

        Return a new CommRecordsFilter without the current city filter applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'city' in locations:
                del new_locations['city']
            new_root['locations'] = new_locations
        return CommRecordsFilter(**new_root)

    def clone_without_state(self):
        """State help needs it's filter cleared before searching for help.

        Return a new CommRecordsFilter without the current state filter
        applied.
        """
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            new_locations = dict(locations)
            if 'state' in locations:
                del new_locations['state']
            new_root['locations'] = new_locations
        return CommRecordsFilter(**new_root)

    def clone_without_tags(self):
        """Tag help works better without tags filtering each other right now.
        """
        new_root = dict(self.__dict__)
        del new_root['tags']
        return CommRecordsFilter(**new_root)

    def filter_query_set(self, qs):
        qs = filter_date_range(self.date_time, 'date_time', qs)

        if self.communication_type:
            qs = qs.filter(contact_type__in=self.communication_type)

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
            qs = qs.filter(contact=contact_qs)

        if self.partner:
            qs = qs.filter(partner__pk__in=self.partner)

        if self.contact:
            qs = qs.filter(contact__pk__in=self.contact)

        return qs
