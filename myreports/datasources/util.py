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
