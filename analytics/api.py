from pymongo import MongoClient
from secrets import MONGO_HOST

from django.shortcuts import Http404

from universal.helpers import get_company_or_404

def views_by_date(request):
    """
    retrieve job views in last 30 days, return as json

    :param request:
    :return: dump of data

    """

    company = get_company_or_404()

    if not company.job_source_ids.first():
        return Http404("No BUID found for attached company")

    buids = [c.id for c in company.job_source_ids.all()]

    client = MongoClient(MONGO_HOST)
    job_views = client.analytics.job_views

    record = job_views.find_one({"buid":{"$in":buids}})

    query = [
        {
            "$group" :
                {
                    "_id":
                        {
                            "month": {"$month": "$time_first_viewed"},
                            "day": {"$dayOfMonth": "$time_first_viewed"},
                            "year": {"$year": "$time_first_viewed"}
                        },
                    "count": {"$sum": 1}
                }
        },
        {"$limit": 1}
    ]

