import json

from datetime import datetime, timedelta

from pymongo import MongoClient
from secrets import MONGO_HOST

from django.shortcuts import Http404, HttpResponse

from universal.helpers import get_company_or_404

def views_last_7_days(request):
    """
    retrieve job views in last 30 days, return as json

    :param request:
    :return: dump of data

    """

    # company = get_company_or_404(request)

    # if not company.job_source_ids.first():
    #     return Http404("No BUID found for attached company")
    #
    # buids = [c.id for c in company.job_source_ids.all()]

    client = MongoClient(MONGO_HOST)
    job_views = client.analytics.job_views

    # query = [
    #     {'$match': {'time_first_viewed': {'$type': 'date'}}},
    #     {'$match': {'time_first_viewed': {'$gte': datetime.today() - timedelta(days=7)}}},
    #     {'$match': {'time_first_viewed': {'$lte': datetime.today()}}},
    #     {
    #         "$group" :
    #             {
    #                 "_id":
    #                     {
    #                         "month": {"$month": "$time_first_viewed"},
    #                         "day": {"$dayOfMonth": "$time_first_viewed"},
    #                         "year": {"$year": "$time_first_viewed"}
    #                     },
    #                 "count": {"$sum": '$view_count'}
    #             }
    #     },
    #     {'$sort': {'_id': -1}}
    # ]
    #
    # records = job_views.aggregate(query)
    #
    # import ipdb; ipdb.set_trace()
    #
    # return HttpResponse(json.dumps([r for r in records]))

    days_back = 4
    def get_start_end(date_in):
        day_start = date_in.replace(hour=0, minute=0, second=0,
                                         microsecond=0)
        day_end = date_in.replace(hour=23, minute=59, second=59,
                                       microsecond=999999)

        return day_start, day_end

    return_counts = []
    for day_back in range(0, days_back + 1):
        day_start, day_end = get_start_end(datetime.now() -
                                           timedelta(days=day_back))

        # query = [
        #     {'$match': {'time_first_viewed': {'$type': 'date'}}},
        #     {'$match': {'time_first_viewed': {'$gte': day_start}}},
        #     {'$match': {'time_first_viewed': {'$lte': day_end}}},
        #     {
        #         "$group" :
        #             {
        #                 "_id": None,
        #                 "count": {"$sum": 1}
        #             }
        #     },
        # ]

        query = {'$type': 'date',
                 'time_first_viewed': {
                     '$gte': day_start,
                     '$lte': day_end
                    }
                 }
        count_views = job_views.find(query).count()

        return_counts.append({'date': day_start.strftime('%m/%d/%y'), 'count': count_views})

    return HttpResponse(json.dumps(return_counts))