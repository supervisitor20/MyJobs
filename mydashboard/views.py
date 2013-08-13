import logging
import operator

from datetime import datetime, timedelta
from urlparse import urlparse

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Q
from django.http import Http404
from django.template import RequestContext
from django.shortcuts import render_to_response

from mydashboard.helpers import saved_searches
from mydashboard.models import *
from myjobs.decorators import user_is_allowed
from myjobs.models import User
from myprofile.models import ProfileUnits
from mysearches.models import SavedSearch
from endless_pagination.decorators import page_template


@page_template("mydashboard/dashboard_activity.html")
@user_is_allowed()
@user_passes_test(lambda u: User.objects.is_group_member(u, 'Employer'))
def dashboard(request, template="mydashboard/mydashboard.html",
    extra_context=None):
    context = {
        'candidates': SavedSearch.objects.all(),
    }    
    """
    Returns a list of candidates who created a saved search for one of the
    microsites within the company microsite list or with the company name like
    jobs.jobs/company_name/careers for example between the given (optional)
    dates
    """
    
    company = Company.objects.filter(admins=request.user)[0]
    admins = CompanyUser.objects.filter(company=company.id)
    authorized_microsites = Microsite.objects.filter(company=company.id)
    
    # Removes main user from admin list to display other admins
    admins = admins.exclude(user=request.user)   
    requested_microsite = request.REQUEST.get('microsite', company.name)  
    requested_after_date = request.REQUEST.get('after', False)
    requested_before_date = request.REQUEST.get('before', False)
    requested_date_button = request.REQUEST.get('date_button', False)    
                
    # the url value for 'All' in the select box is company name 
    # which then gets replaced with all microsite urls for that company
    site_name = ''
    if requested_microsite != company.name:
        if requested_microsite.find('//') == -1:
            requested_microsite = '//' + requested_microsite
        active_microsites = authorized_microsites.filter(
                url__contains=requested_microsite)
        
    else:
        active_microsites = authorized_microsites
        site_name = company.name
        
    microsite_urls = [microsite.url for microsite in active_microsites]
    if not site_name:
        site_name = microsite_urls[0]      

    q_list = [Q(url__contains=ms) for ms in microsite_urls]
    
    # All searches saved on the employer's company microsites       
    candidate_searches = SavedSearch.objects.select_related('user')
    candidate_searches = candidate_searches.filter(reduce(operator.or_, q_list))    
        
    # Pre-set Date ranges
    if 'today' in request.REQUEST:
        after = datetime.now() - timedelta(days=1)
        before = datetime.now() 
        requested_date_button = 'today'
    elif 'seven_days' in request.REQUEST:
        after = datetime.now() - timedelta(days=7)
        before = datetime.now()
        requested_date_button = 'seven_days'
    elif 'thirty_days' in request.REQUEST:
        after = datetime.now() - timedelta(days=30)
        before = datetime.now()
        requested_date_button = 'thirty_days'
    else:
        if requested_after_date:            
            after = datetime.strptime(requested_after_date, '%m/%d/%Y')            
        else:
            after = request.REQUEST.get('after')
            if after:
                after = datetime.strptime(after, '%m/%d/%Y')
            else:
                # Defaults to 30 days ago
                after = datetime.now() - timedelta(days=30)                
                
        if requested_before_date:
            before = datetime.strptime(requested_before_date, '%m/%d/%Y')            
        else:        
            before = request.REQUEST.get('before')
            if before:
                before = datetime.strptime(before, '%m/%d/%Y')
            else:
                # Defaults to the date and time that the page is accessed
                before = datetime.now()
    
    # Specific microsite searches saved between two dates
    candidate_searches = candidate_searches.filter(
            created_on__range=[after, before]).order_by('-created_on')       
    
    admin_you = request.user
    
    context = {'company_name': company.name,
               'company_microsites': authorized_microsites,
               'company_admins': admins,                 
               'after': after,
               'before': before,                 
               'candidates': candidate_searches,                
               'admin_you': admin_you,
               'site_name': site_name,
               'view_name': 'Company Dashboard',
               'date_button': requested_date_button,}
    
    if extra_context is not None:
        context.update(extra_context)
    return render_to_response(template, context,
        context_instance=RequestContext(request))


@user_is_allowed()
@user_passes_test(lambda u: User.objects.is_group_member(u, 'Employer'))
def microsite_activity(request):
    """
    Returns the activity information for the microsite that was select on the
    employer dashboard page.  Candidate activity for saved searches, job
    views, etc.
    """
    company = Company.objects.filter(admins=request.user)[0]

    requested_microsite = request.REQUEST.get('microsite_url', False)
    requested_date_button = request.REQUEST.get('date_button', False)
    requested_after_date = request.REQUEST.get('after', False)
    requested_before_date = request.REQUEST.get('before', False)

    if not requested_microsite:
        requested_microsite = request.REQUEST.get('microsite-hide',
                                                  company.name)

    if requested_microsite.find('//') == -1:
        requested_microsite = '//' + requested_microsite

    # Pre-set Date ranges
    if 'today' in request.REQUEST:
        after = datetime.now() - timedelta(days=1)
        before = datetime.now()
        requested_date_button = 'today'
    elif 'seven_days' in request.REQUEST:
        after = datetime.now() - timedelta(days=7)
        before = datetime.now()
        requested_date_button = 'seven_days'
    elif 'thirty_days' in request.REQUEST:
        after = datetime.now() - timedelta(days=30)
        before = datetime.now()
        requested_date_button = 'thirty_days'
    else:
        if requested_after_date:
            after = datetime.strptime(requested_after_date, '%m/%d/%Y')
        else:
            after = request.REQUEST.get('after')
            if after:
                after = datetime.strptime(after, '%m/%d/%Y')
            else:
                # Defaults to 30 days ago
                after = datetime.now() - timedelta(days=30)

        if requested_before_date:
            before = datetime.strptime(requested_before_date, '%m/%d/%Y')
        else:
            before = request.REQUEST.get('before')
            if before:
                before = datetime.strptime(before, '%m/%d/%Y')
            else:
                # Defaults to the date and time that the page is accessed
                before = datetime.now()

    # All searches saved on the employer's company microsites
    candidate_searches = SavedSearch.objects.filter(
        url__contains=requested_microsite)

    # Specific microsite searches saved between two dates
    candidate_searches = candidate_searches.filter(
        created_on__range=[after, before]).order_by('-created_on')

    saved_search_count = candidate_searches.count()

    paginator = Paginator(candidate_searches, 25) # Show 25 candidates per page
    page = request.GET.get('page')

    try:
        candidates = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        candidates = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        candidates = paginator.page(paginator.num_pages)

    data_dict = {'microsite_url': requested_microsite,
                 'after': after,
                 'before': before,
                 'candidates': candidates,
                 'view_name': 'Company Dashboard',
                 'company_name': company.name,
                 'date_button': requested_date_button,
                 'saved_search_count': saved_search_count}

    return render_to_response('mydashboard/microsite_activity.html', data_dict,
                              context_instance=RequestContext(request))


@user_is_allowed()
@user_passes_test(lambda u: User.objects.is_group_member(u, 'Employer'))
def candidate_information(request, user_id):
    """
    Sends user info, primary name, and searches to candidate_information.html.
    Gathers the employer's (request.user) companies and microsites and puts
    the microsites' domains in a list for further checking and logic,
    see helpers.py.
    """
    # gets returned with response to request
    data_dict = {}
    models = {}
    name = "Name not given"

    # user gets pulled out from id
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise Http404

    urls = saved_searches(request.user, user)
    if not urls:
        raise Http404

    if not user.opt_in_employers:
        raise Http404

    units = user.profileunits_set.all()

    for unit in units:
        if getattr(unit, unit.get_model_name()).is_displayed():
            models.setdefault(unit.get_model_name(), []).append(
                getattr(unit, unit.get_model_name()))

    # if Name ProfileUnit exsists
    if models.get('name'):
        name = models['name'][0]
        models.pop('name')

    searches = user.savedsearch_set.filter(url__in=urls)

    data_dict = {'user_info': models,
                 'primary_name': name,
                 'the_user': user,
                 'searches': searches}

    return render_to_response('mydashboard/candidate_information.html',
                              data_dict, RequestContext(request))
