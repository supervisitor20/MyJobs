"""CommRecords DataSource"""
from operator import __or__

from mypartners.models import (
    Contact, Status, Location, Tag, ContactRecord, Partner)

from myreports.datasources.util import (
    DataSource, DataSourceFilter, dispatch_help_by_field_name,
    filter_date_range)


from universal.helpers import dict_identity

from django.db.models import Q


class CommRecordsDataSource(DataSource):
    def run(self, company, filter_spec, order):
        qs_filtered = self.filtered_query_set(company, filter_spec)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def extract_record(self, record):
        return {
            'contact': record.contact.name,
            'contact_email': record.contact_email,
            'contact_phone': record.contact_phone,
            'communication_type': record.contact_type,
            'created_on': record.created_on,
            'created_by': self.extract_user_email(record.created_by),
            'date_time': record.date_time,
            'job_applications': record.job_applications,
            'job_hires': record.job_hires,
            'job_id': record.job_id,
            'job_interviews': record.job_interviews,
            'last_action_time': record.last_action_time,
            'length': record.length,
            'location': record.location,
            'notes': record.notes,
            'partner': record.partner.name,
            'subject': record.subject,
            'tags': [t.name for t in record.tags.all()],
        }

    def extract_user_email(self, user):
        if user:
            return user.email
        else:
            return None

    def filter_type(self):
        return CommRecordsFilter

    def help(self, company, filter_spec, field, partial):
        return dispatch_help_by_field_name(
            self, company, filter_spec, field, partial)

    def help_city(self, company, filter_spec, partial):
        """Get help for the city field."""
        modified_filter_spec = filter_spec.clone_without_city()
        comm_records_qs = self.filtered_query_set(company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__contactrecord__in=comm_records_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'key': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter_spec, partial):
        """Get help for the state field."""
        modified_filter_spec = filter_spec.clone_without_state()
        comm_records_qs = self.filtered_query_set(company, modified_filter_spec)
        locations_qs = (
            Location.objects
            .filter(contacts__contactrecord__in=comm_records_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'key': c['state'], 'display': c['state']} for c in state_qs]

    def help_tags(self, company, filter_spec, partial):
        """Get help for the tags field."""
        comm_records_qs = self.filtered_query_set(company, filter_spec)

        tags_qs = (
            Tag.objects
            .filter(contactrecord__in=comm_records_qs)
            .filter(name__icontains=partial)
            .values('name', 'hex_color').distinct())
        return [
            {
                'key': t['name'],
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
            {
                'key': c['contact_type'],
                'display': c['contact_type'],
            } for c in contact_types_qs]

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
                'key': c['pk'],
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
                'key': c['pk'],
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

    def filter_query_set(self, qs):
        qs = filter_date_range(self.date_time, 'date_time', qs)

        if self.communication_type:
            qs = qs.filter(contact_type=self.communication_type)

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
