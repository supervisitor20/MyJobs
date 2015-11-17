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
        date_begin = filter_spec.get('date_begin', None)
        if date_begin is not None:
            kwargs['date_begin'] = datetime.strptime(date_begin, "%Y-%m-%d")

        date_end = filter_spec.get('date_end', None)
        if date_end is not None:
            kwargs['date_end'] = datetime.strptime(date_end, "%Y-%m-%d")

        kwargs['city'] = filter_spec.get('city', None)
        kwargs['state'] = filter_spec.get('state', None)
        kwargs['tags'] = filter_spec.get('tags', None)
        kwargs['partner'] = filter_spec.get('partner', None)

        return ContactsFilter(**kwargs)

    def build_order(self, order_spec):
        return json.loads(order_spec)

    def encode_filter_interface(self, filter_interface_list):
        filters = [
            self.encode_single_filter_interface(f)
            for f in filter_interface_list
        ]

        help_available = dict(
            (f.filter, True)
            for f in filter_interface_list
            if f.help)

        return {
            'filters': filters,
            'help': help_available,
        }

    def encode_single_filter_interface(self, filter_interface):
        if filter_interface.filters is not None:
            return {
                'type': filter_interface.type,
                'filters': filter_interface.filters,
                'display': filter_interface.display
            }
        else:
            return {
                'type': filter_interface.type,
                'filter': filter_interface.filter,
                'display': filter_interface.display
            }


class ContactsDataSource(object):
    def run(self, company, filter, order):
        qs_filtered = self.filtered_query_set(company, filter)
        qs_ordered = qs_filtered.order_by(*order)
        qs_distinct = qs_ordered.distinct()
        return [self.extract_record(r) for r in qs_distinct]

    def help_city(self, company, filter, partial):
        modified_filter = filter.clone_with(city=None)
        contacts_qs = self.filtered_query_set(company, modified_filter)
        locations_qs = (
            Location.objects
            .filter(contacts__in=contacts_qs)
            .filter(city__icontains=partial))
        city_qs = locations_qs.values('city').distinct()
        return [{'key': c['city'], 'display': c['city']} for c in city_qs]

    def help_state(self, company, filter, partial):
        modified_filter = filter.clone_with(state=None)
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
    def __init__(self, date_begin=None, date_end=None, state=None,
                 city=None, tags=None, partner=None):
        self.date_begin = date_begin
        self.date_end = date_end
        self.state = state
        self.city = city
        self.tags = tags
        self.partner = partner

    def clone_with(self, **kwargs):
        new_keys = self.__dict__
        new_keys.update(kwargs)
        return ContactsFilter(**new_keys)

    def filter_query_set(self, qs):
        if (self.date_begin is not None and
                self.date_end is not None):
            qs = qs.filter(
                last_action_time__range=tuple([
                    self.date_begin,
                    self.date_end + timedelta(days=1)]))
        elif self.date_begin is not None:
            qs = qs.filter(last_action_time__gte=self.date_begin)
        elif self.date_end is not None:
            qs = qs.filter(last_action_time__lte=self.date_end)

        if self.tags is not None:
            qs = qs.filter(tags__name__in=self.tags)

        if self.partner is not None:
            qs = qs.filter(partner__pk__in=self.partner)

        if self.city is not None:
            qs = qs.filter(locations__city__iexact=self.city)

        if self.state is not None:
            qs = qs.filter(locations__state__iexact=self.state)

        return qs
