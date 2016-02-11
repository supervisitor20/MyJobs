"""Partners DataSource"""
from operator import __or__
from datetime import datetime

from mypartners.models import Contact, Partner, Status, Location, Tag

from myreports.datasources.util import (
    dispatch_help_by_field_name, dispatch_run_by_data_type,
    filter_date_range, extract_tags)
from myreports.datasources.base import DataSource, DataSourceFilter
from myreports.datasources.sql import (
    count_comm_rec_per_month_per_partner_sql)
from myreports.datasources.rowstream import (
    DjangoField, from_django, DjangoRowBuilder,
    from_cursor, sort_stream, from_list)

from universal.helpers import dict_identity

from django.db.models import Q
from django.db import connection


class PartnersDataSource(DataSource):
    partner_row_builder = DjangoRowBuilder([
        DjangoField('id', rename='partner_id'),
        DjangoField('data_source'),
        DjangoField('last_action_time', rename='date'),
        DjangoField('name'),
        DjangoField('primary_contact.name', rename='primary_contact'),
        DjangoField('tags', transform=extract_tags),
        DjangoField('uri')])

    def run(self, data_type, company, filter_spec, order):
        return dispatch_run_by_data_type(
            self, data_type, company, filter_spec, order)

    def filtered_partners(self, company, filter_spec):
        qs_filtered = filter_spec.filter_partners(company)
        qs_distinct = qs_filtered.distinct()
        return qs_distinct

    def run_unaggregated(self, company, filter_spec, order):
        qs_filtered = filter_spec.filter_partners(company)
        qs_ordered = qs_filtered.order_by(*order)
        qs_optimized = qs_ordered.prefetch_related(
            'tags', 'primary_contact')

        partners = from_django(self.partner_row_builder, qs_optimized)
        return list(partners)

    def run_count_comm_rec_per_month(self, company, filter_spec, order):
        # Get a list of valid partners (according to our filter).
        qs_filtered = filter_spec.filter_partners(company)
        partner_ids = [r['id'] for r in qs_filtered.values('id').all()]

        # If there are no partners, we're done.
        if not partner_ids:
            return []

        sql = count_comm_rec_per_month_per_partner_sql
        cursor = connection.cursor()
        cursor.execute(sql, {'partner_list': partner_ids})
        count_stream = from_cursor(cursor)

        # Iterate over counts results.
        # Find year range and organize counts for later.
        min_year = None
        max_year = None
        db_counts = {}
        for record in count_stream:
            partner_id = record['partner_id']
            year = record['year']
            month = record['month']
            comm_rec_count = record['comm_rec_count']

            if year < min_year or min_year is None:
                min_year = year
            if year < max_year or max_year is None:
                max_year = year

            key = (partner_id, year, month)
            db_counts[key] = comm_rec_count

        # If there are no communication records, assume current year.
        if not db_counts:
            min_year = datetime.now().year
            max_year = min_year

        # Create full range of time slots with counts.
        # DB won't fill in zero's without a complex query.
        # Do this instead.
        full_counts = {}
        for partner_id in partner_ids:
            count_list = []
            full_counts[partner_id] = count_list
            for year in xrange(min_year, max_year + 1):
                for month in xrange(1, 12 + 1):
                    key = (partner_id, year, month)
                    if key in db_counts:
                        count = db_counts[key]
                        count_list.append((year, month, count))
                    else:
                        count_list.append((year, month, 0))

        qs_optimized = qs_filtered.prefetch_related('tags', 'primary_contact')
        partners = from_django(self.partner_row_builder, qs_optimized)

        # Join the two streams
        joined_fields = partners.fields + ['year', 'month', 'comm_rec_count']
        joined_data = []
        for partner_record in partners:
            count_list = full_counts.get(partner_record['partner_id'], [])
            for count_tuple in count_list:
                year, month, count = count_tuple
                joined_record = dict(partner_record)
                joined_record.update({
                    'year': year,
                    'month': month,
                    'comm_rec_count': count,
                    })
                joined_data.append(joined_record)
        joined = from_list(joined_fields, joined_data)

        sorted_stream = sort_stream(order, joined)

        return list(sorted_stream)

    def filter_type(self):
        return PartnersFilter

    def help(self, company, filter_spec, field, partial):
        return dispatch_help_by_field_name(
            self, company, filter_spec, field, partial)

    def help_city(self, company, filter_spec, partial):
        """Get help for the city field."""
        modified_filter_spec = filter_spec.clone_without_city()
        partners_qs = modified_filter_spec.filter_partners(company)
        locations_qs = (
            Location.objects
            .filter(contacts__partner__in=partners_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'key': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter_spec, partial):
        """Get help for the state field."""
        modified_filter_spec = filter_spec.clone_without_state()
        partners_qs = modified_filter_spec.filter_partners(company)
        locations_qs = (
            Location.objects
            .filter(contacts__partner__in=partners_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'key': c['state'], 'display': c['state']} for c in state_qs]

    def help_tags(self, company, filter_spec, partial):
        """Get help for the tags field."""
        partners_qs = filter_spec.filter_partners(company)

        tags_qs = (
            Tag.objects
            .filter(partner__in=partners_qs)
            .filter(name__icontains=partial)
            .values('name', 'hex_color').distinct())
        return [
            {
                'key': t['name'],
                'display': t['name'],
                'hexColor': t['hex_color'],
            } for t in tags_qs]

    def help_uri(self, company, filter_spec, partial):
        """Get help for the uri field."""
        partners_qs = filter_spec.filter_partners(company)

        uris_qs = (
            partners_qs
            .filter(uri__icontains=partial)
            .values('uri').distinct())
        return [{'key': c['uri'], 'display': c['uri']} for c in uris_qs]

    def help_data_source(self, company, filter_spec, partial):
        """Get help for the data_source field."""
        partners_qs = filter_spec.filter_partners(company)

        data_sources_qs = (
            partners_qs
            .filter(data_source__icontains=partial)
            .values('data_source').distinct())
        return [
            {'key': c['data_source'], 'display': c['data_source']}
            for c in data_sources_qs
        ]


@dict_identity
class PartnersFilter(DataSourceFilter):
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
        # XXX: delete me
        pass

    def filter_partners(self, company):
        qs = Partner.objects.filter(owner=company)
        qs = (
            qs
            .filter(approval_status__code__iexact=Status.APPROVED)
            .filter(archived_on__isnull=True))

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
