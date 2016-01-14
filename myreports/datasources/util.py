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
