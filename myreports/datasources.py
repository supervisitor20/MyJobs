import json
from datetime import timedelta, datetime

from mypartners.models import Contact, Location, Tag, Partner

from universal.helpers import dict_identity


def get_datasource_json_driver(datasource_name):
    if datasource_name == 'contacts':
        return ContactsDataSourceJsonDriver(ContactsDataSource())


class ContactsDataSourceJsonDriver(object):
    def __init__(self, ds):
        self.ds = ds

    def run(self, company, filter_spec, order_spec):
        return self.ds.run(
            company,
            self.build_filter(filter_spec),
            self.build_order(order_spec))

    def help(self, company, filter_spec, field, partial):
        method = getattr(self.ds, 'help_' + field)
        return method(company, self.build_filter(filter_spec), partial)

    def build_filter(self, filter_json):
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
        kwargs['partner'] = filter_spec.get('partner', None)

        return ContactsFilter(**kwargs)

    def build_order(self, order_spec):
        return json.loads(order_spec)

    def encode_filter_interface(self, report_configuration):
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


class ContactsDataSource(object):
    def run(self, company, filter, order):
        qs_filtered = self.filtered_query_set(company, filter)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def help_city(self, company, filter, partial):
        modified_filter = filter.clone_without_city()
        contacts_qs = self.filtered_query_set(company, modified_filter)
        locations_qs = (
            Location.objects
            .filter(contacts__in=contacts_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'key': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter, partial):
        modified_filter = filter.clone_without_state()
        contacts_qs = self.filtered_query_set(company, modified_filter)
        locations_qs = (
            Location.objects
            .filter(contacts__in=contacts_qs)
            .filter(state__icontains=partial))
        state_qs = locations_qs.values('state').distinct()
        return [{'key': s['state'], 'display': s['state']} for s in state_qs]

    def help_tags(self, company, filter, partial):
        contacts_qs = self.filtered_query_set(company, filter)

        tags_qs = (
            Tag.objects
            .filter(contact__in=contacts_qs)
            .filter(name__icontains=partial))
        names_qs = tags_qs.values('name').distinct()
        return [{'key': t['name'], 'display':t['name']} for t in names_qs]

    def help_partner(self, company, filter, partial):
        contacts_qs = self.filtered_query_set(company, filter)
        partners_qs = (
            Partner.objects
            .filter(contact__in=contacts_qs)
            .filter(name__icontains=partial))
        data_qs = partners_qs.values('name', 'pk').distinct()
        return [{'key': t['pk'], 'display':t['name']} for t in data_qs]

    def extract_record(self, record):
        return {
            'name': record.name,
            'partner': record.partner.name,
            'email': record.email,
            'phone': record.phone,
            'notes': record.notes,
            'locations': [
                {'city': l.city, 'state': l.state}
                for l in record.locations.all()
            ],
            'date': record.last_action_time,
            'tags': [t.name for t in record.tags.all()],
        }

    def filtered_query_set(self, company, filter):
        qs_company = Contact.objects.filter(partner__owner=company)
        qs_filtered = filter.filter_query_set(qs_company)
        return qs_filtered


@dict_identity
class ContactsFilter(object):
    def __init__(self, date=None, locations=None, tags=None, partner=None):
        self.date = date
        self.locations = locations
        self.tags = tags
        self.partner = partner

    def clone_without_city(self):
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            if 'city' in locations:
                new_locations = dict(locations)
                del new_locations['city']
            new_root['locations'] = new_locations
        return ContactsFilter(**new_root)

    def clone_without_state(self):
        new_root = dict(self.__dict__)
        locations = new_root.get('locations', None)
        if locations:
            if 'state' in locations:
                new_locations = dict(locations)
                del new_locations['state']
            new_root['locations'] = new_locations
        return ContactsFilter(**new_root)

    def filter_query_set(self, qs):
        if self.date is not None:
            if (self.date[0] is not None and
                    self.date[1] is not None):
                qs = qs.filter(
                    last_action_time__range=tuple([
                        self.date[0],
                        self.date[1] + timedelta(days=1)]))
            elif self.date[0] is not None:
                qs = qs.filter(last_action_time__gte=self.date[0])
            elif self.date[1] is not None:
                qs = qs.filter(
                    last_action_time__lte=self.date[1] + timedelta(days=1))

        if self.tags:
            qs = qs.filter(tags__name__in=self.tags)

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
