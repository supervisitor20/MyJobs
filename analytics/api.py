import json, math

from datetime import datetime, timedelta

from pymongoenv import connect_db

from django.shortcuts import HttpResponse
from django.http import HttpResponseNotAllowed, Http404
from django.views.decorators.csrf import csrf_exempt

from dateutil import parser as dateparser

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

    job_views = get_mongo_db().job_views

    query = [
        {'$match': {'time_first_viewed': {'$type': 'date'}}},
        {'$match': {'time_first_viewed': {'$gte': datetime.today() -
                                                  timedelta(days=7)}}},
        {'$match': {'time_first_viewed': {'$lte': datetime.today()}}},
        {
            "$group":
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

    filtered_analytics = get_mongo_db().analytics

    query = [
        {'$match': {'time': {'$type': 'date'}}},
        {'$match': {'time': {'$gte': datetime.today() -
                                     timedelta(days=7)}}},
        {'$match': {'time': {'$lte': datetime.today()}}},
        {
            "$group":
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

    filtered_analytics = get_mongo_db().analytics

    query = [
        {'$match': {'dn': {'$type': 'string'}}},
        {
            "$group":
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


# @requires("view_analytics")
@csrf_exempt
def dynamic_chart(request):
    """
    return charting data given a set of filters, date range, and drilldown
    selection

    request
    {
        "date_start": "01/01/2016 00:00:00",
        "date_end": "01/08/2016 00:00:00",
        "active_filters": [{"type": "country", "value": "USA"},
                         {"type": "state", "value": "Indiana"}],
        "next_filter": "browser",
    }

    response
    {
        "column_names":
            [
                {"key": "browser", "label": "Browser"},
                {"key": "job_views", "label": "Job Views"},
             ],
        "rows":
            [
                {"browser": "Chrome", "job_views": "101",  "visits": "1050"},
                {"browser": "IE11", "job_views": "231", "visits": "841"},
                {"browser": "IE8", "job_views": "23", "visits": "341"},
                {"browser": "Firefox", "job_views": "21", "visits": "298"},
                {"browser": "Netscape Navigator", "job_views": "1", "visits": "1"},
                {"browser": "Dolphin", "job_views": "1", "visits": "1"}
             ]
    }


    """
    def format_dict(input_dict, next_filter):
        # TODO: Add real handling for job_views
        aggregation_key = input_dict['_id']
        adjusted_count, error = std_error_with_count(input_dict['visitors'])
        return {
            next_filter: aggregation_key,
            'visitors': adjusted_count,
            'job_views': adjusted_count,
        }

    def calculate_error_and_count(total_count, sample_count, row_count):
        proportion = float(row_count) / float(sample_count)
        inner = proportion * (1.0-proportion) / sample_count
        error = 3 * math.sqrt(inner) * total_count
        adjusted_count = total_count * proportion
        return int(adjusted_count), int(error)

    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    # user_company = get_company_or_404(request)

    job_views = get_mongo_db().job_views
    query_data = json.loads(request.POST.get('request', '{}'))

    if not query_data:
        # Temporary code: Remove before production
        response = {
            "column_names":
                [
                    {"key": "browser", "label": "Browser"},
                    {"key": "visitors", "label": "Visitors"},
                    {"key": "job_views", "label": "Job Views"}
                 ],
            "rows":
                [
                    {"browser": "Chrome", "visitors": "101",  "job_views": "1050"},
                    {"browser": "IE11", "visitors": "231", "job_views": "841"},
                    {"browser": "IE8", "visitors": "23", "job_views": "341"},
                    {"browser": "Firefox", "visitors": "21", "job_views": "298"},
                    {"browser": "Netscape Navigator", "visitors": "1", "job_views": "1"},
                    {"browser": "Dolphin", "visitors": "1", "job_views": "1"}
                 ]
        }
        return HttpResponse(json.dumps(response))

    try:
        date_start = dateparser.parse(query_data['date_start'])
    except ValueError:
        raise Http404('Invalid date start: ' + query_data['date_start'])

    try:
        date_end = dateparser.parse(query_data['date_end'])
    except ValueError:
        raise Http404('Invalid date end: ' + query_data['date_end'])

    next_filter = query_data['next_filter']

    top_query = {
        # buid script to be added once it's available in records
        # 'buid': {'$in': company_buids}
        'time_first_viewed': {
            '$gte': date_start,
            '$lte': date_end
        }
    }
    print top_query
    count = job_views.find(top_query).count()
    print count

    sample_script = []
    std_error_with_count = lambda x: calculate_error_and_count(count, count, x)
    if count > 10000:
        std_error_with_count = lambda x: calculate_error_and_count(count,
                                                                   10000,
                                                                   x)
        sample_script = [{'$sample': {'size': 10000}}]

    for a_filter in query_data['active_filters']:
        top_query[a_filter['type']] = a_filter['value']

    query = [
        {'$match': top_query},
    ]

    query = query + sample_script + [
        {
            "$group" :
                {
                    "_id": "$" + next_filter,
                    "visitors": {"$sum": 1},
                    "view_count": {"$sum": '$view_count'}
                }
            },
        {'$sort': {'visitors': -1}},
        {'$limit': 10},
    ]

    print query

    # hardcoded until mongo can be made less... slow as hell
    records = [
        {"visitors": 1509, "view_count": 1509, "_id": "USA"},
        {"visitors": 501, "view_count": 1509, "_id": "ENG"},
        {"visitors": 376, "view_count": 1509, "_id": "GER"},
        {"visitors": 229, "view_count": 1509, "_id": "AUS"},
        {"visitors": 173, "view_count": 1509, "_id": "FRA"},
       ]

    records = job_views.aggregate(query)

    response = {
        "column_names":
            [
                {"key": "found_on", "label": "Found On"},
                {"key": "job_views", "label": "Job Views"},
             ],
        "rows":
            [format_dict(r, next_filter) for r in records],
    }

    return HttpResponse(json.dumps(response))

def get_drilldown_categories(request):
    """
    return a list of possible drilldown categories. this is currently
    hard-coded, but will eventually be loaded via the DB and thus be
    dynamic

    :param request: GET
    :return: list of possible drilldown categories

    """
    response = [
        {"key": "country", "label": "Country"},
        {"key": "state", "label": "State"},
        {"key": "city", "label": "City"},
        {"key": "job_source_name", "label": "Job Source"},
        {"key": "time_found", "label": "Time Found"},
        {"key": "found_on", "label": "Site Found"},
    ]

    return HttpResponse(json.dumps(response))


def get_mongo_db():
    """
    Retrieve the current mongo database (defined in settings.MONGO_DBNAME).
    :return: a mongo database
    """
    return connect_db().db