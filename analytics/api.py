import json

from datetime import datetime, timedelta

from pymongo import MongoClient
from secrets import MONGO_HOST

from django.shortcuts import Http404, HttpResponse

def views_last_7_days(request):
    """
    retrieve job views in last 30 days, return as json

    :param request:
    :return: counts per day

    """

    return Http404("View not yet enabled")