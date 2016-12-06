import json, math

from datetime import datetime, timedelta

from pymongoenv import connect_db

from django.shortcuts import HttpResponse
from django.http import HttpResponseNotAllowed, Http404
from django.views.decorators.csrf import csrf_exempt

from dateutil import parser as dateparser

from myjobs.decorators import requires
from universal.helpers import get_company_or_404

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

    client = connect_db().client
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

    client = connect_db().client
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

    client = connect_db().client
    filtered_analytics = client.analytics.analytics

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


def format_return_dict(record, group_label):
    """
    format return dict to have meaningful group by title rather than _id
    could be expanded to include other formatting as needed

    :param record: individual document retrieved from mongo
    :param group_label: the current group by column
    :return: formatted record


    """
    group_value = record.pop('_id')
    return_dict = {group_label: group_value}
    return_dict.update(record)
    return return_dict


def calculate_error_and_count(population, sample_count, row_count):
    """
    take a set of inputs and calculate the standard error and total count
    for a given row

    :param population: total number of rows matching top query
    :param sample_count: number of rows we are sampling
    :param row_count: the count for a given row
    :return: standard error and population-adjusted count (tuple)


    """
    proportion = float(row_count) / float(sample_count)
    inner = proportion * (1.0-proportion) / sample_count
    error = 3 * math.sqrt(inner) * population
    adjusted_count = population * proportion
    return error, int(adjusted_count)


def adjust_records_for_sampling(records, error_and_count):
    """
    adjust the records in the incoming data set to account for sample size vs
    population

    :param records: grouped records from mongo
    :param error_and_count: function to retrieve standard error and true count
    :return: records adjusted for


    """
    return_list = []
    for record in records:
        new_record = {}
        for key, value in record.iteritems():
            if key == '_id':
                new_record[key] = value
            else:
                new_record[key] = error_and_count(value)[1]
        return_list.append(new_record)

    return return_list


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

    top_query = {}
    if buids:
        if len(buids) > 1:
            buid_inner = {'$in': buids}
        else:
            buid_inner = buids[0]
        top_query = {'buid': buid_inner}

    top_query['time_first_viewed'] = {'$gte': date_start,
                                      '$lte': date_end
                                     }

    print top_query
    return top_query


def build_active_filter_query(query_data):
    """
    build active query filters based on what is provided

    :param query_data: query data from request
    :return: active filter queries


    """
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
    # TODO: Add DB handling / "filter chain" logic
    next_filter = query_data['next_filter']
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
                    "job_views": {"$sum": '$view_count'}
                }
            },
        {'$sort': {'visitors': -1}},
        {'$limit': 10}
    ]

    return group_query


def get_mongo_client():
    """
    retrieve mongo client for queries

    :return: a mongo client


    """
    client = connect_db().client

    return client


def get_company_buids(request):
    """
    retrieve a list of buids for a given company

    :param request:
    :return: buids (list)


    """
    user_company = get_company_or_404(request)
    job_sources = user_company.job_source_ids.all()
    return [job_source.id for job_source in job_sources]


@requires("view analytics")
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

    buids = []
    buids = get_company_buids(request)

    top_query = build_top_query(query_data, buids)

    sample_query, total_count = retrieve_sampling_query_and_count(job_views,
                                                                  top_query,
                                                                  sample_size)

    if not sample_query:
        sample_size = total_count

    active_filter_query = build_active_filter_query(query_data)

    group_by = determine_data_group_by_column(query_data)

    group_query = build_group_by_query(group_by)

    query = [
        {'$match': top_query},
    ] + sample_query + active_filter_query + group_query

    print query

    records = job_views.aggregate(query, allowDiskUse=True)

    if sample_query:
        def curried_query(count):
            return calculate_error_and_count(total_count, sample_size, count)

        records = adjust_records_for_sampling(records, curried_query)

    response = {
        "column_names":
            [
                {"key": "found_on", "label": "Found On"},
                {"key": "job_views", "label": "Job Views"},
                {"key": "visitors", "label": "Visitors"},
             ],
        "rows":
            [format_return_dict(r, group_by) for r in records],
    }

    return HttpResponse(json.dumps(response))
