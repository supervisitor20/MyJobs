import json, math, csv

from datetime import datetime, timedelta

from pymongo import MongoClient
from secrets import MONGO_HOST

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


def format_return_dict(query_dict, group_label):
    group_value = query_dict.pop('_id')
    return {group_label: group_value}.update(query_dict)


def calculate_error_and_count(total_count, sample_count, row_count):
    proportion = float(row_count) / float(sample_count)
    inner = proportion * (1.0-proportion) / sample_count
    error = 3 * math.sqrt(inner) * total_count
    adjusted_count = total_count * proportion
    return error, int(adjusted_count)


def adjust_records_for_sampling(records, error_and_count):
    """
    adjust the records in the incoming data set to account for sample size vs
    population

    :param records: grouped records from mongo
    :param error_and_count: function to retrieve standard error and true count
    :return: records adjusted for


    """
    for record in records:
        for key, value in record.iteritems():
            if key != '_id':
                record[key] = error_and_count(value)[1]

    return records


def build_top_query(query_data, buids=None):
    """
    build the highest level query from the data provided

    :param input_data: data from the request
    :param buids: BUIDs from the current company
    :return: top level query


    """
    try:
        date_start = dateparser.parse(query_data['date_start'])
    except ValueError:
        raise Http404('Invalid date start: ' + query_data['date_start'])

    try:
        date_end = dateparser.parse(query_data['date_end'])
    except ValueError:
        raise Http404('Invalid date end: ' + query_data['date_end'])

    buid_query = {'buid': {'$in': buids}} if buids else {}
    top_query = buid_query['time_first_viewed'] = {'$gte': date_start,
                                                   '$lte': date_end
                                                   }

    return top_query


def build_active_filter_query(query_data):
    filter_match = {'$match': {}}
    for a_filter in query_data['active_filters']:
        filter_match['$match'][a_filter['type']] = a_filter['value']

    return [filter_match] if filter_match['$match'] else []


def determine_data_group_by_column(query_data):
    """
    determine what to group the data by. this can be retrieved from the db
    or provided in the request if a filter_overwrite is present

    :param query_data: data from the request
    :return: the column to group data by


    """
    # TODO: Add DB handling
    next_filter = query_data['filter_overwrite']
    return next_filter


def retrieve_sampling_query_and_count(collection, top_query, sample_size):
    """
    If the count from the top query is higher than the sample size, return
    a sampling pipeline component to place into the main query

    :param collection: the collection we're targeting (job_views typically)
    :param top_query: highest level filtering query
    :param sample_size: how large the sample should be (count cut off)
    :return: sample query (if needed) and count (tuple)


    """

    # sample_script = []
    # std_error_with_count = lambda x: calculate_error_and_count(count, count, x)
    # if count > sample_size:
    #     std_error_with_count = lambda x: calculate_error_and_count(count,
    #                                                                sample_size,
    #                                                                x)
    #     sample_script = [{'$sample': {'size': sample_size}}]

    count = collection.find(top_query).count()

    sample_script = []
    if count > sample_size:
        sample_script = [{'$sample': {'size': sample_size}}]

    return sample_script, count


def build_group_by_query(group_by):
    """
    create group section of the aggregate query

    :param group_by: column by which to group data/get counts
    :return: group by query (list)


    """
    group_query = [
        {
            "$group" :
                {
                    "_id": "$" + group_by,
                    "visitors": {"$sum": 1},
                    "view_count": {"$sum": '$view_count'}
                }
            },
        {'$sort': {'visitors': -1}},
    ]

    return group_query


def get_mongo_client():
    """
    retrieve mongo client for queries
    :return:


    """
    import ssl
    conn_string = "mongodb://production-consumers:iwWoRX8skE1PTNFr@de-" \
                  "analytics-production-shard-00-00-gg0it.mongodb.net:27017" \
                  ",de-analytics-production-shard-00-01-gg0it.mongodb.net:" \
                  "27017,de-analytics-production-shard-00-02-gg0it.mongodb." \
                  "net:27017/admin?ssl=true&replicaSet=de-analytics-" \
                  "production-shard-0&authSource=admin"
    client = MongoClient(conn_string, ssl_cert_reqs=ssl.CERT_NONE)
    # client = MongoClient(MONGO_HOST)

    return client


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
        "sample_size": "10000"
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
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    sample_size = 50000 # TODO: Add sample size to request object
    query_data = json.loads(request.POST.get('request', '{}'))

    if not query_data:
        raise Http404('No data provided')

    job_views = get_mongo_client().analytics.job_views

    top_query = build_top_query(query_data)

    sample_query, total_count = retrieve_sampling_query_and_count(job_views,
                                                                  top_query,
                                                                  sample_size)
    if not sample_query:
        sample_size = total_count

    active_filter_query = build_active_filter_query(query_data)

    group_by = determine_data_group_by_column(query_data)

    group_query = build_group_by_query(query_data, group_by)

    query = [
        {'$match': top_query},
    ] + sample_query + active_filter_query + group_query

    records = job_views.aggregate(query, allowDiskUse=True)

    if sample_query:
        def curried_query(count):
            calculate_error_and_count(total_count, sample_size, count)

        records = adjust_records_for_sampling(records, curried_query)

    response = {
        "column_names":
            [
                {"key": "found_on", "label": "Found On"},
                {"key": "visitors", "label": "Visitors"},
                {"key": "job_views", "label": "Job Views"}
             ],
        "rows":
            [format_return_dict(r, group_by) for r in records],
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