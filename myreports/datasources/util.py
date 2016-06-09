from operator import __or__
from django.db.models import Q
from datetime import timedelta


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


def filter_arg(field, op, data):
    return {
        field + '__' + op: data
    }


def filter_date_range(dates, field, qs):
    if dates is None:
        return qs

    begin = None
    if (dates[0] is not None):
        begin = dates[0]

    end = None
    if (dates[1] is not None):
        end = dates[1] + timedelta(days=1)

    if (begin is not None and end is not None):
        qs = qs.filter(**filter_arg(field, 'range', (begin, end)))
    elif end is not None:
        qs = qs.filter(**filter_arg(field, 'lte', end))
    elif begin is not None:
        qs = qs.filter(**filter_arg(field, 'gte', begin))
    return qs


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


def filter_tags(tag_link_field, tag_and_group_list, queryset):
    """
    Implements standard tag filtering.

    tag_link_field: django model field reference from base model.
        Should have a name field.
        i.e. tags or contact__tags
    tag_and_group_list: list of lists of tag names.
        i.e. [['red', 'blue'], ['nice']]
    queryset: base queryset, filters will be applied to this
    """
    name_match_selector = tag_link_field + '__name__iexact'
    list_empty = True
    or_qs = []
    for tag_ors in tag_and_group_list:
        if tag_ors:
            list_empty = False
            or_qs.append(
                reduce(
                    __or__,
                    map(lambda t: Q(**{name_match_selector: t}),
                        tag_ors)))
    for or_q in or_qs:
        queryset = queryset.filter(or_q)
    if list_empty:
        # if an empty tags list was received, return only untagged
        # items
        queryset = queryset.filter(**{tag_link_field: None})

    return queryset


def adorn_tags(company, tag_and_group_list, help_method, ds_filter):
    """
    Build an adorned list of tags.

    company: company we are currently working with
    tag_and_group_list: list of lists of tag names.
        i.e. [['red', 'blue'], ['nice']]
    help_method: method called to build the adorned lists
    ds_filter: a datasource filter which will work with help_method
        it should be empty
    """
    result = []
    for known_or_tags in tag_and_group_list:
        or_group = []

        for known_tag in known_or_tags:
            tags = help_method(company, ds_filter, known_tag)
            if tags:
                or_group.append(tags[0])

        if or_group:
            result.append(or_group)
    return result
