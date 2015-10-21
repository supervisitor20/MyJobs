from collections import OrderedDict
from datetime import datetime
import json

from django.core.files.base import ContentFile
from django.db.models.loading import get_model
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.views.decorators.http import require_http_methods

from myreports.helpers import humanize, serialize
from myreports.models import Report, ReportingType, ReportType
from postajob import location_data
from universal.helpers import get_company_or_404
from universal.decorators import has_access

# TODO limit access by app
def overview(request):
    """
    View for overview.
    """
    company = get_company_or_404(request)
    ctx = {
        "company": company
    }

    return render_to_response('manage/overview.html', ctx,
                              RequestContext(request))

def view_roles(request):
    """
    View for listing roles.
    """
    company = get_company_or_404(request)
    ctx = {
        "company": company
    }

    return render_to_response('manage/role_list.html', ctx,
                              RequestContext(request))

def edit_role(request):
    """
    View for editing a role.
    """
    company = get_company_or_404(request)
    ctx = {
        "company": company
    }

    return render_to_response('manage/edit_role.html', ctx,
                              RequestContext(request))

def view_users(request):
    """
    View for listing users.
    """
    company = get_company_or_404(request)
    ctx = {
        "company": company
    }

    return render_to_response('manage/user_list.html', ctx,
                              RequestContext(request))

def edit_user(request):
    """
    View for editing a users.
    """
    company = get_company_or_404(request)
    ctx = {
        "company": company
    }

    return render_to_response('manage/edit_user.html', ctx,
                              RequestContext(request))
