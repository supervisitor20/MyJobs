'''Encode more complex datatypes in JSON.

This module provides a python JSON object_hook and ...JsonEncoder for
serializing and deseralizing data more complex than the JSON datatypes
supported by default.

So far datetime is the only supported data type.

Serialized JSON objects handled by this module include a __type__ member.
'''

import json
from datetime import datetime
from django.utils.dateparse import parse_datetime


def encode_datetime(datetime_obj):
    return datetime_obj.isoformat()


def report_hook(obj):
    if '__type__' in obj and obj['__type__'] == 'datetime':
        return parse_datetime(obj['datetime'])
    else:
        return obj


class ReportJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {
                '__type__': 'datetime',
                'datetime': encode_datetime(obj),
            }
        else:
            return super(ReportJsonEncoder, self).default(obj)
