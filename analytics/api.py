import json

from datetime import datetime, timedelta

from pymongo import MongoClient
from secrets import MONGO_HOST

from django.shortcuts import HttpResponse

from myjobs.decorators import requires


@requires("view analytics")
def views_last_7_days(request):
    """
    retrieve job views in last 7 days, return as json

    :param request:
    :return: dump of data

    """
    def format_dict(input_dict):
        record_date = input_dict['_id']
        return {
            'day': "%s/%s/%s" % (record_date['year'],
                                 record_date['month'],
                                 record_date['day']),
            'hits': input_dict['count']
        }

    client = MongoClient(MONGO_HOST)
    job_views = client.analytics.job_views

    query = [
        {'$match': {'time_first_viewed': {'$type': 'date'}}},
        {'$match': {'time_first_viewed': {'$gte': datetime.today() -
                                                  timedelta(days=7)}}},
        {'$match': {'time_first_viewed': {'$lte': datetime.today()}}},
        {
            "$group" :
                {
                    "_id":
                        {
                            "month": {"$month": "$time_first_viewed"},
                            "day": {"$dayOfMonth": "$time_first_viewed"},
                            "year": {"$year": "$time_first_viewed"}
                        },
                    "count": {"$sum": '$view_count'}
                }
        },
        {'$sort': {'_id': 1}}
    ]

    records = job_views.aggregate(query)

    return HttpResponse(json.dumps([format_dict(r) for r in records]))


@requires("view analytics")
def activity_last_7_days(request):
    """
    retrieve analytics hits in last 7 days, return as json

    :param request:
    :return: dump of data

    """
    def format_dict(input_dict):
        record_date = input_dict['_id']
        return {
            'day': "%s/%s/%s" % (record_date['year'],
                                 record_date['month'],
                                 record_date['day']),
            'hits': input_dict['count']
        }

    client = MongoClient(MONGO_HOST)
    filtered_analytics = client.analytics.analytics

    query = [
        {'$match': {'time': {'$type': 'date'}}},
        {'$match': {'time': {'$gte': datetime.today() -
                                     timedelta(days=7)}}},
        {'$match': {'time': {'$lte': datetime.today()}}},
        {
            "$group" :
                {
                    "_id":
                        {
                            "month": {"$month": "$time"},
                            "day": {"$dayOfMonth": "$time"},
                            "year": {"$year": "$time"}
                        },
                    "count": {"$sum": 1}
                }
        },
        {'$sort': {'_id': 1}}
    ]

    records = filtered_analytics.aggregate(query)

    return HttpResponse(json.dumps([format_dict(r) for r in records]))

@requires("view analytics")
def campaign_percentages(request):
    """
    retrieve campaign percentages, return as json

    :param request:
    :return: dump of data

    """
    def format_dict(input_dict):
        record_date = input_dict['_id']
        return input_dict

    client = MongoClient(MONGO_HOST)
    filtered_analytics = client.analytics.analytics

    query = [
        {'$match': {'dn': {'$type': 'string'}}},
        {
            "$group" :
                {
                    "_id":
                        {
                            "campaign": '$dn',
                        },
                    "count": {"$sum": 1}
                }
        },
        {'$limit': 10},
        {'$sort': {'_id': 1}}
    ]

    records = filtered_analytics.aggregate(query)

    return HttpResponse(json.dumps([format_dict(r) for r in records]))