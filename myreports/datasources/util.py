from operator import __or__, __and__
from django.db.models import Q
from datetime import timedelta
from universal.helpers import dict_identity


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


def dispatch_run_by_data_type(ds, data_type, company, filter_spec, order_spec):
    """Invoke ds.run_[date_type] method.

    example:
        given data_type='partner_per_month':
        return ds.run_partner_per_month(company, filter_spec, order_spec)

    Breaks up large run methods into smaller run methods separated by
    data_type.

    signatures of run_[data_type] should match the signature of
    DataSource.run without the data_type parameter.
    """
    method = getattr(ds, 'run_' + data_type)
    return method(company, filter_spec, order_spec)


def build_q(field, op, data):
    return Q(**{field + '__' + op: data})


def extract_tags(tag_list):
    """Extract name + hex_color + ... from tags."""
    return [
        {
            'id': t.id,
            'name': t.name,
            'hex_color': t.hex_color,
        }
        for t in tag_list.all()
    ]


def apply_filter_to_queryset(queryset, filt, field, extension=None):
    if extension:
        full_field = field + extension
    else:
        full_field = field

    result = queryset

    if isinstance(filt, AndGroupFilter):
        for child in filt.child_filters:
            result = apply_filter_to_queryset(result, child, full_field)
    elif isinstance(filt, UnlinkedFilter):
        result = result.filter(**{field: None})
    else:
        q = filt.as_q(full_field)
        if q is not None:
            result = result.filter(q)
    return result


def plain_filter(full_filter):
    return {
        k: reduce_filter(v)
        for k, v in full_filter.__dict__.iteritems()
        if v
    }


def reduce_filter(filt):
    if isinstance(filt, MatchFilter):
        return filt.value
    elif isinstance(filt, OrGroupFilter):
        return [
            reduce_filter(f)
            for f in filt.child_filters
        ]
    elif isinstance(filt, AndGroupFilter):
        return [
            reduce_filter(f)
            for f in filt.child_filters
        ]
    elif isinstance(filt, CompositeAndFilter):
        return {
            k: reduce_filter(v)
            for k, v in filt.field_map.iteritems()
        }
    elif isinstance(filt, DateRangeFilter):
        return filt.dates
    elif isinstance(filt, UnlinkedFilter):
        return {'nolink': True}
    else:
        return filt


@dict_identity
class AndGroupFilter(object):
    def __init__(self, child_filters):
        self.child_filters = child_filters


@dict_identity
class CompositeAndFilter(object):
    def __init__(self, field_map):
        self.field_map = field_map

    def as_q(self, db_field_map):
        usable_fields = {
            k: v
            for k, v in {
                k: v.as_q(db_field_map[k])
                for k, v in self.field_map.iteritems()
                if k in db_field_map
            }.iteritems()
            if v is not None
        }

        if not usable_fields:
            return None

        return reduce(__and__, (q for q in usable_fields.itervalues()))


@dict_identity
class OrGroupFilter(object):
    def __init__(self, child_filters):
        self.child_filters = child_filters

    def as_q(self, field):
        if not self.child_filters:
            return None

        return reduce(__or__, (cf.as_q(field) for cf in self.child_filters))


@dict_identity
class MatchFilter(object):
    def __init__(self, value):
        self.value = value

    def as_q(self, field):
        if self.value is None:
            return None

        return Q(**{field: self.value})


@dict_identity
class DateRangeFilter(object):
    def __init__(self, dates):
        self.dates = dates

    def as_q(self, field):
        if self.dates is None:
            return None

        begin = None
        if (self.dates[0] is not None):
            begin = self.dates[0]

        end = None
        if (self.dates[1] is not None):
            end = self.dates[1] + timedelta(days=1)

        if (begin is not None and end is not None):
            return build_q(field, 'range', (begin, end))
        elif end is not None:
            return build_q(field, 'lte', end)
        elif begin is not None:
            return build_q(field, 'gte', begin)
        return None


@dict_identity
class UnlinkedFilter(object):
    pass


@dict_identity
class NoFilter(object):
    def __nonzero__(self):
        return False

    def as_q(self, field):
        return None


def adorn_filter(company, datasource, full_filter):
    collected = {
        k: collect_matches(f)
        for k, f in full_filter.__dict__.iteritems()
        if f
    }
    adorned_items = datasource.adorn_filter_items(company, collected)

    adorned_filter_dict = {
        k: place_adornments(f, adorned_items.get(k, {}))
        for k, f in full_filter.__dict__.iteritems()
        if f
    }

    return datasource.filter_type()(**adorned_filter_dict)


def collect_matches(filt):
    if isinstance(filt, MatchFilter):
        return [filt.value]
    elif isinstance(filt, OrGroupFilter) or isinstance(filt, AndGroupFilter):
        return [
            item for sublist in [
                collect_matches(f)
                for f in filt.child_filters
            ]
            for item in sublist
        ]
    elif isinstance(filt, CompositeAndFilter):
        return {
            k: collect_matches(f)
            for k, f in filt.field_map.iteritems()
        }
    else:
        return filt


def place_adornments(filt, adorned_items):
    if isinstance(filt, MatchFilter):
        return MatchFilter(adorned_items.get(filt.value, filt.value))
    elif isinstance(filt, OrGroupFilter):
        return OrGroupFilter([
            place_adornments(f, adorned_items)
            for f in filt.child_filters
        ])
    elif isinstance(filt, AndGroupFilter):
        return AndGroupFilter([
            place_adornments(f, adorned_items)
            for f in filt.child_filters
        ])
    elif isinstance(filt, CompositeAndFilter):
        adorned_field_map = {
            k: place_adornments(f, adorned_items[k])
            for k, f in filt.field_map.iteritems()
            if k in adorned_items
        }
        merged_field_map = dict(filt.field_map)
        merged_field_map.update(adorned_field_map)
        return CompositeAndFilter(merged_field_map)
    else:
        return filt
