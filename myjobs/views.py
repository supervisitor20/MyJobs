import base64
import datetime
import json
import logging
import urllib2
from urlparse import urlparse
import uuid

from django.conf import settings
from django.contrib.auth import logout, authenticate
from django.contrib.auth.decorators import user_passes_test
from django.db import IntegrityError
from django.forms import Form, model_to_dict
from django.http import HttpResponse, HttpResponseRedirect
from django.core import serializers
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response, redirect, render, Http404
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.contrib.admin.views.decorators import staff_member_required

from captcha.fields import ReCaptchaField

from universal.helpers import get_domain
from myjobs.decorators import user_is_allowed, requires, MissingActivity
from myjobs.forms import ChangePasswordForm, EditCommunicationForm
from myjobs.helpers import expire_login, log_to_jira, get_title_template
from myjobs.models import Ticket, User, FAQ, CustomHomepage, Role, Activity
from myprofile.forms import (InitialNameForm, InitialEducationForm,
                             InitialAddressForm, InitialPhoneForm,
                             InitialWorkForm)
from myprofile.models import ProfileUnits, Name
from registration.forms import RegistrationForm, CustomAuthForm
from tasks import process_sendgrid_event
from universal.helpers import get_company_or_404
from seo.models import Company
from universal.decorators import has_access

logger = logging.getLogger('__name__')


class About(TemplateView):
    template_name = "about.html"


class Privacy(TemplateView):
    template_name = "privacy-policy.html"


class Terms(TemplateView):
    template_name = "terms.html"


class CaptchaForm(Form):
    captcha = ReCaptchaField(label="", attrs={'theme': 'white'})


def error_500(request):
    response = render(request, "500.html")
    response.status_code = 500
    return response


def home(request):
    """
    The home page view receives 2 separate Ajax requests, one for the
    registration form and another for the initial profile information form. If
    everything checks out alright and the form saves with no errors, it returns
    a simple string, 'valid', as an HTTP Response, which the front end
    recognizes as a signal to continue with the account creation process. If an
    error occurs, this triggers the jQuery to update the page. The form
    instances with errors must be passed back to the form template it was
    originally from.

    """
    registration_form = RegistrationForm(auto_id=False)
    login_form = CustomAuthForm(auto_id=False)

    name_form = InitialNameForm(prefix="name")
    education_form = InitialEducationForm(prefix="edu")
    phone_form = InitialPhoneForm(prefix="ph")
    work_form = InitialWorkForm(prefix="work")
    address_form = InitialAddressForm(prefix="addr")
    nexturl = request.GET.get('next')
    title_template = get_title_template(nexturl)
    if nexturl:
        nexturl = urllib2.unquote(nexturl)
        nexturl = urllib2.quote(nexturl.encode('utf8'))

    last_ms = request.COOKIES.get('lastmicrosite')
    site_name = ''
    logo_url = ''
    show_registration = True
    if last_ms:
        try:
            last_ms = get_domain(last_ms)
            custom_page = CustomHomepage.objects.get(domain=last_ms)
            logo_url = custom_page.logo_url
            show_registration = custom_page.show_signup_form
            site_name = custom_page.name

        except CustomHomepage.DoesNotExist:
            pass

    data_dict = {'num_modules': len(settings.PROFILE_COMPLETION_MODULES),
                 'registrationform': registration_form,
                 'loginform': login_form,
                 'name_form': name_form,
                 'phone_form': phone_form,
                 'address_form': address_form,
                 'work_form': work_form,
                 'education_form': education_form,
                 'nexturl': nexturl,
                 'logo_url': logo_url,
                 'show_registration': show_registration,
                 'site_name': site_name,
                 'logo_template': title_template,
                 }

    if request.method == "POST":
        if request.POST.get('action') == "register":
            registration_form = RegistrationForm(request.POST, auto_id=False)
            if registration_form.is_valid():
                new_user, created = User.objects.create_user(
                    request=request,
                    send_email=True,
                    **registration_form.cleaned_data)
                user_cache = authenticate(
                    username=registration_form.cleaned_data['email'],
                    password=registration_form.cleaned_data['password1'])
                expire_login(request, user_cache)
                # pass in gravatar url once user is logged in. Image generated
                # on AJAX success
                html = render_to_response('includes/account-page-2.html',
                                          data_dict, RequestContext(request))
                data = {'gravatar_url': new_user.get_gravatar_url(size=100),
                        'html': html.content}
                response = HttpResponse(json.dumps(data))
                response.set_cookie('myguid', new_user.user_guid,
                                    expires=365*24*60*60, domain='.my.jobs')
                return response
            else:
                return HttpResponse(json.dumps(
                    {'errors': registration_form.errors.items()}))

        elif request.POST.get('action') == "login":
            login_form = CustomAuthForm(data=request.POST)
            if login_form.is_valid():
                expire_login(request, login_form.get_user())

                url = request.POST.get('nexturl')

                # Boolean for activation login page to show initial forms
                # again or not
                has_units = False
                if len(login_form.get_user().profileunits_set.all()) > 0:
                    has_units = True

                response_data = {
                    'validation': 'valid', 'url': url,
                    'units': has_units,
                    'gravatar_url': login_form.get_user().get_gravatar_url(
                        size=100)}
                response = HttpResponse(json.dumps(response_data))
                response.set_cookie('myguid', login_form.get_user().user_guid,
                                    expires=365*24*60*60, domain='.my.jobs')
                return response
            else:
                return HttpResponse(json.dumps({'errors':
                                                login_form.errors.items()}))

        elif request.POST.get('action') == "save_profile":
            name_form = InitialNameForm(request.POST, prefix="name",
                                        user=request.user)
            if not name_form.changed_data:
                name_form = InitialNameForm(prefix="name")

            education_form = InitialEducationForm(request.POST, prefix="edu",
                                                  user=request.user)
            if not education_form.changed_data:
                education_form = InitialEducationForm(prefix="edu")

            phone_form = InitialPhoneForm(request.POST, prefix="ph",
                                          user=request.user)
            if not phone_form.changed_data:
                phone_form = InitialPhoneForm(prefix="ph")

            work_form = InitialWorkForm(request.POST, prefix="work",
                                        user=request.user)
            if not work_form.changed_data:
                work_form = InitialWorkForm(prefix="work")

            address_form = InitialAddressForm(request.POST, prefix="addr",
                                              user=request.user)
            if not address_form.changed_data:
                address_form = InitialAddressForm(prefix="addr")

            forms = [name_form, education_form, phone_form, work_form,
                     address_form]
            valid_forms = [form for form in forms if form.is_valid()]
            invalid_forms = []
            for form in forms:
                if form.changed_data and not form.is_valid():
                    invalid_forms.append(form)

            if not invalid_forms:
                for form in valid_forms:
                    if form.changed_data:
                        form.save(commit=False)
                        form.user = request.user
                        form.save_m2m()
                return HttpResponse('valid')
            else:
                return render_to_response('includes/initial-profile-form.html',
                                          {'name_form': name_form,
                                           'phone_form': phone_form,
                                           'address_form': address_form,
                                           'work_form': work_form,
                                           'education_form': education_form},
                                          context_instance=RequestContext(
                                              request))

    return render_to_response('index.html', data_dict, RequestContext(request))


def contact_faq(request):
    """
    Grabs FAQ and orders them by alphabetical order on question.

    """
    faq = FAQ.objects.filter(is_visible=True).order_by('question')
    if not faq.count() > 0:
        return HttpResponseRedirect(reverse('contact'))
    data_dict = {'faq': faq}
    return render_to_response('contact-faq.html', data_dict, RequestContext(request))


def contact(request):
    if request.POST:
        name = request.POST.get('name')
        contact_type = request.POST.get('type')
        reason = request.POST.get('reason')
        from_email = request.POST.get('email')
        phone_num = request.POST.get('phone')
        comment = request.POST.get('comment')
        form = CaptchaForm(request.POST)
        if form.is_valid():
            components = []
            component_ids = {'My.jobs Error': {'id': '12903'},
                             'Job Seeker': {'id': '12902'},
                             'Employer': {'id': '12900'},
                             'Partner': {'id': '12901'},
                             'Request Demo': {'id': '13900'}}
            if component_ids.get(reason):
                components.append(component_ids.get(reason))
            components.append(component_ids.get(contact_type))
            issue_dict = {
                'summary': '%s - %s' % (reason, from_email),
                'description': '%s' % comment,
                'issuetype': {'name': 'Task'},
                'customfield_10400': str(name),
                'customfield_10401': str(from_email),
                'customfield_10402': str(phone_num),
                'components': components}

            subject = 'Contact My.jobs by a(n) %s' % contact_type
            body = """
                   Name: %s
                   Is a(n): %s
                   Email: %s

                   %s
                   """ % (name, contact_type, from_email, comment)

            to_jira = log_to_jira(subject, body, issue_dict, from_email)
            if to_jira:
                time = datetime.datetime.now().strftime(
                    '%A, %B %d, %Y %l:%M %p')
                return HttpResponse(json.dumps({'validation': 'success',
                                                'name': name,
                                                'c_type': contact_type,
                                                'reason': reason,
                                                'c_email': from_email,
                                                'phone': phone_num,
                                                'comment': comment,
                                                'c_time': time}))
            else:
                return HttpResponse('success')
        else:
            return HttpResponse(json.dumps({'validation': 'failed',
                                            'errors': form.errors.items()}))
    else:
        form = CaptchaForm()
        data_dict = {'form': form}
    return render_to_response('contact.html', data_dict,
                              RequestContext(request))


@user_is_allowed()
@user_passes_test(User.objects.not_disabled)
def edit_account(request):
    user = request.user
    obj = User.objects.get(id=user.id)
    change_password = False

    if user.is_verified:
        communication_form = EditCommunicationForm(user=user, instance=obj)
    else:
        communication_form = None
    password_form = ChangePasswordForm(user=user)

    if request.user.password_change:
        change_password = True

    ctx = {
        'user': user,
        'communication_form': communication_form,
        'password_form': password_form,
        'change_password': change_password,
    }

    if request.method == "POST":
        obj = User.objects.get(id=request.user.id)
        if 'communication' in request.REQUEST:
            form = EditCommunicationForm(user=request.user, instance=obj,
                                         data=request.POST)
            if form.is_valid():
                form.save()
                ctx['communication_form'] = form
                ctx['message_body'] = ('Communication Settings have been '
                                       'updated successfully.')
                ctx['messagetype'] = 'success'
                template = '%s/edit-account.html' % settings.PROJECT
                return render_to_response(template, ctx,
                                          RequestContext(request))
            else:
                ctx['communication_form'] = form
                template = '%s/edit-account.html' % settings.PROJECT
                return render_to_response(template, ctx,
                                          RequestContext(request))

        elif 'password' in request.REQUEST:
            form = ChangePasswordForm(user=request.user, data=request.POST)
            if form.is_valid():
                request.user.password_change = False
                request.user.save()
                form.save()
                ctx['password_form'] = form
                ctx['message_body'] = ('Password Settings have been '
                                       'updated successfully.')
                ctx['messagetype'] = 'success'
                template = '%s/edit-account.html' % settings.PROJECT
                return render_to_response(template, ctx,
                                          RequestContext(request))
            else:
                ctx['password_form'] = form
                template = '%s/edit-account.html' % settings.PROJECT
                return render_to_response(template, ctx,
                                          RequestContext(request))
        else:
            raise Http404("This view may only be reach via POST request.")

    return render_to_response('%s/edit-account.html' % settings.PROJECT, ctx,
                              RequestContext(request))


@user_passes_test(User.objects.not_disabled)
def delete_account(request):
    email = request.user.email
    request.user.delete()

    template = '%s/delete-account-confirmation.html' % settings.PROJECT
    ctx = {'email': email}

    return render_to_response(template, ctx, RequestContext(request))


@user_passes_test(User.objects.not_disabled)
def disable_account(request):
    user = request.user
    email = user.email
    user.disable()
    logout(request)

    template = '%s/disable-account-confirmation.html' % settings.PROJECT
    ctx = {'email': email}

    return render_to_response(template, ctx, RequestContext(request))


@csrf_exempt
def batch_message_digest(request):
    """
    Used by SendGrid to POST batch events.

    Accepts a POST request containing a batch of events from SendGrid. A batch
    of events is a series of JSON strings separated by new lines (Version 1 and
    2) or as well formed JSON (Version 3)

    Creates a celery task that adds these events to the EmailLog.

    """
    if 'HTTP_AUTHORIZATION' in request.META:
        method, details = request.META['HTTP_AUTHORIZATION'].split()
        if method.lower() == 'basic':
            # login_info is intended to be a base64-encoded string in the
            # format "email:password" where email is a urlquoted string
            login_info = base64.b64decode(details).split(':')
            if len(login_info) == 2:
                login_info[0] = urllib2.unquote(login_info[0])
                user, password = login_info

                if (user == settings.SENDGRID_BATCH_POST_USER and
                        password == settings.SENDGRID_BATCH_POST_PASSWORD):

                    process_sendgrid_event.delay(request.body)
                    return HttpResponse(status=200)
    return HttpResponse(status=403)


@user_is_allowed(pass_user=True)
def continue_sending_mail(request, user=None):
    """
    Updates the user's last response time to right now.
    Allows the user to choose to continue receiving emails if they are
    inactive.
    """
    user = user or request.user
    user.last_response = datetime.date.today()
    user.save()
    return redirect('/')


def check_name_obj(user):
    """
    Utility function to process and return the user name object.

    Inputs:
    :user:  request.user object

    Returns:
    :initial_dict: Dictionary object with updated name information
    """
    initial_dict = model_to_dict(user)
    try:
        name = Name.objects.get(user=user, primary=True)
    except Name.DoesNotExist:
        name = None
    if name:
        initial_dict.update(model_to_dict(name))
    return initial_dict


@user_is_allowed(pass_user=True)
def unsubscribe_all(request, user=None):
    user = user or request.user
    user.opt_in_myjobs = False
    user.save()

    return render_to_response('myjobs/unsubscribe_all.html',
                              context_instance=RequestContext(request))


def toolbar(request):
    user = request.user
    if not user or user.is_anonymous():
        # Ensure that old myguid cookies can be handled correctly
        guid = request.COOKIES.get('myguid', '').replace('-', '')
        try:
            user = User.objects.get(user_guid=guid)
        except User.DoesNotExist:
            pass
    if not user or user.is_anonymous():
        data = {"user_fullname": "",
                "user_gravatar": "",
                "employer": ""}
    else:
        try:
            name = user.get_full_name()
            if not name:
                name = user.email
        except ProfileUnits.DoesNotExist:
            name = user.email
        employer = (True if user.groups.filter(name='Employer')
                    else False)
        data = {"user_fullname": (("%s..." % name[:17]) if len(name) > 20
                                  else name),
                "user_gravatar": user.get_gravatar_url(),
                "employer": employer}
    callback = request.GET.get('callback', '')
    response = '%s(%s);' % (callback, json.dumps(data))
    response = HttpResponse(response, content_type="text/javascript")
    caller = request.REQUEST.get('site', '')
    if caller and not caller.endswith('www.my.jobs'):
        max_age = 30 * 24 * 60 * 60
        last_name = request.REQUEST.get('site_name', caller)
        response.set_cookie(key='lastmicrosite',
                            value=caller,
                            max_age=max_age,
                            domain='.my.jobs')
        response.set_cookie(key='lastmicrositename',
                            value=last_name,
                            max_age=max_age,
                            domain='.my.jobs')
    return response


def cas(request):
    redirect_url = request.GET.get('redirect_url', 'http://www.my.jobs/')
    user = request.user

    if not user or user.is_anonymous():
        guid = request.COOKIES.get('myguid')
        try:
            user = User.objects.get(user_guid=guid)
        except User.DoesNotExist:
            pass
    if not user or user.is_anonymous():
        response = redirect("https://secure.my.jobs/?next=%s" %
                            redirect_url)
    else:
        ticket = Ticket()
        try:
            ticket.ticket = uuid.uuid4()
            ticket.session_id = request.session.session_key
            ticket.user = request.user
            ticket.save()
        except IntegrityError:
            return cas(request)
        except Exception, e:
            logging.error("cas: %s" % e)
            response = redirect("https://secure.my.jobs/?next=%s" %
                                redirect_url)
        else:
            if '?' in redirect_url:
                response = redirect("%s&ticket=%s&uid=%s" %
                                    (redirect_url, ticket.ticket,
                                     ticket.user.user_guid))
            else:
                response = redirect("%s?ticket=%s&uid=%s" %
                                    (redirect_url, ticket.ticket,
                                     ticket.user.user_guid))
    caller = urlparse(redirect_url)
    try:
        page = CustomHomepage.objects.get(domain=caller.netloc.split(":")[0])
        response.set_cookie(key='lastmicrosite',
                                value="%s://%s" % (caller.scheme,
                                                   caller.netloc),
                                max_age=30 * 24 * 60 * 60,
                                domain='.my.jobs')
        response.set_cookie(key='lastmicrositename',
                                value=page.name,
                                max_age=30 * 24 * 60 * 60,
                                domain='.my.jobs')
    except CustomHomepage.DoesNotExist:
        pass

    return response


def topbar(request):
    callback = request.REQUEST.get('callback')
    user = request.user

    if not user or user.is_anonymous():
        # Ensure that old myguid cookies can be handled correctly
        guid = request.COOKIES.get('myguid', '').replace('-', '')
        try:
            user = User.objects.get(user_guid=guid)
        except User.DoesNotExist:
            pass

    if not user or user.is_anonymous():
        user = None

    ctx = {'user': user}

    response = HttpResponse(content_type='text/javascript')

    caller = request.REQUEST.get('site', '')
    if caller:
        max_age = 30 * 24 * 60 * 60
        last_name = request.REQUEST.get('site_name', caller)
        response.set_cookie(key='lastmicrosite',
                            value=caller,
                            max_age=max_age,
                            domain='.my.jobs')
        response.set_cookie(key='lastmicrositename',
                            value=last_name,
                            max_age=max_age,
                            domain='.my.jobs')

    html = render_to_response('includes/topbar.html', ctx,
                              RequestContext(request))

    response.content = "%s(%s)" % (callback, json.dumps(html.content))

    return response

@staff_member_required
@requires('read role', 'read user')
def manage_users(request):
    """
    View for manage users
    """

    company = get_company_or_404(request)

    ctx = {
        "company": company
        }

    return render_to_response('manageusers/index.html', ctx,
                                RequestContext(request))

@staff_member_required
def api_get_activities(request):
    """
    Retrieves all activities
    """

    activities = Activity.objects.all()
    return HttpResponse(serializers.serialize("json", activities, fields=('name', 'description')))

@staff_member_required
@requires('read role')
def api_get_roles(request):
    """
    GET /manage-users/api/roles/
    Retrieves all roles associated with a company
    """

    response_data = {}

    company = get_company_or_404(request)

    roles = Role.objects.filter(company=company)
    for role in roles:
        role_id = role.id

        response_data[role_id] = {}

        response_data[role_id]['role'] = {}
        response_data[role_id]['role']['id'] = role.id
        response_data[role_id]['role']['name'] = role.name

        response_data[role_id]['activities'] = {}
        # This company has access to various apps by means of multiple app_access_id's
        # Retrieve all activities with these app_access_id's
        available_activities = Activity.objects.filter(app_access__in=company.app_access.all())
        response_data[role_id]['activities']['available'] = serializers.serialize("json", available_activities, fields=('name', 'description'))
        # Retrieve all activities assigned to this role
        assigned_activities = role.activities.all()
        response_data[role_id]['activities']['assigned'] = serializers.serialize("json", assigned_activities, fields=('name', 'description'))

        # Retrieve users already assigned to this role
        users_assigned = User.objects.filter(roles__id=role_id)
        response_data[role_id]['users'] = {}
        response_data[role_id]['users']['assigned'] = serializers.serialize("json", users_assigned, fields=('email'))

        # Retrieve users that can be assigned to this role
        # This is simply a list of all users already assigned to roles associated with this company
        users_available = []
        roles = Role.objects.filter(company=company)
        for role in roles:
            role_id_temp = role.id
            users = User.objects.filter(roles__id=role_id_temp)
            for user in users:
                if user not in users_available:
                    users_available.append(user)
        response_data[role_id]['users']['available'] = serializers.serialize("json", users_available, fields=('email'))

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('read role')
def api_get_specific_role(request, role_id=0):
    """
    GET /manage-users/api/roles/NUMBER
    Retrieves specific role
    """

    response_data = {}

    # Check if role exists
    if Role.objects.filter(id=role_id).exists() == False:
        response_data["success"] = "false"
        response_data["message"] = "Role does not exist."
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    company = get_company_or_404(request)

    response_data[role_id] = {}

    role = Role.objects.filter(id=role_id).filter(company=company)

    response_data[role_id]['role'] = {}
    response_data[role_id]['role']['id'] = role[0].id
    response_data[role_id]['role']['name'] = role[0].name

    response_data[role_id]['activities'] = {}
    # This company has access to various apps by means of multiple app_access_id's
    # Retrieve all activities with these app_access_id's
    available_activities = Activity.objects.filter(app_access__in=company.app_access.all())
    response_data[role_id]['activities']['available'] = serializers.serialize("json", available_activities, fields=('name', 'description'))
    # Retrieve all activities assigned to this role
    assigned_activities = role[0].activities.all()
    response_data[role_id]['activities']['assigned'] = serializers.serialize("json", assigned_activities, fields=('name', 'description'))

    # Retrieve users already assigned to this role
    users_assigned = User.objects.filter(roles__id=role_id)
    response_data[role_id]['users'] = {}
    response_data[role_id]['users']['assigned'] = serializers.serialize("json", users_assigned, fields=('email'))

    # Retrieve users that can be assigned to this role
    # This is simply a list of all users already assigned to roles associated with this company
    users_available = []
    roles = Role.objects.filter(company=company)
    for role in roles:
        role_id_temp = role.id
        users = User.objects.filter(roles__id=role_id_temp)
        for user in users:
            if user not in users_available:
                users_available.append(user)
    response_data[role_id]['users']['available'] = serializers.serialize("json", users_available, fields=('email'))

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('create role')
def api_create_role(request):
    """
    POST /manage-users/api/roles/create
    Creates a new role

    Inputs:
    :role_name:                 name of role
    :assigned_activities:       activities assigned to this role
    :assigned_users:            users assigned to this role

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "POST":
        response_data["success"] = "false"
        response_data["message"] = "POST method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        company = get_company_or_404(request)

        if request.POST.get("role_name", ""):
            role_name = request.POST['role_name']

        matching_roles = Role.objects.filter(name=role_name)
        if matching_roles.exists():
            response_data["success"] = "false"
            response_data["message"] = "Another role with this name already exists."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        activity_ids = []
        if request.POST.getlist("assigned_activities[]", ""):
            activities = request.POST.getlist("assigned_activities[]", "")
            # Create list of activity_ids from names
            for i, activity in enumerate(activities):
                activity_object = Activity.objects.filter(name=activity)
                activity_id = activity_object[0].id
                activity_ids.append(activity_id)
        # At least one activity must be selected
        if not activity_ids:
            response_data["success"] = "false"
            response_data["message"] = "Each role must have at least one activity."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # User objects have roles
        users = request.POST.getlist("assigned_users[]", [])

        # Create Role
        new_role = Role.objects.create(name=role_name, company_id=company.id)

        # Assign activities to this new role
        new_role.activities.add(*activity_ids)

        # Add role to relevant users
        if users:
            for i, user in enumerate(users):
                user_object = User.objects.filter(email=user)
                user_object[0].roles.add( new_role.id )

        response_data["success"] = "true"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('update role')
def api_edit_role(request, role_id=0):
    """
    POST /manage-users/api/roles/edit
    Edits an existing role

    Inputs:
    :role_id:                   unique id of role
    :role_name:                 name of role
    :assigned_activites:        activities assigned to this role
    :assigned_users:            users assigned to this role

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "POST":
        response_data["success"] = "false"
        response_data["message"] = "POST method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        # Check if role exists
        if Role.objects.filter(id=role_id).exists() == False:
            response_data["success"] = "false"
            response_data["message"] = "Role does note exist."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        company = get_company_or_404(request)

        # Check if the company the user is associated with manages this role
        role = Role.objects.get(pk=role_id)
        if role.company.id != company.id:
            response_data["success"] = "false"
            response_data["message"] = "The company you are associated with does not manage this role."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # INPUT - role_name
        role_name = request.POST.get("role_name", "")
        # Role names must be unique
        matching_roles = Role.objects.filter(name=role_name).exclude(pk=role_id)
        if matching_roles.exists():
            response_data["success"] = "false"
            response_data["message"] = "Another role with this name already exists."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # INPUT - assigned_activites
        activities = request.POST.getlist("assigned_activities[]", "")

        # At least one activity must be selected
        if activities == "" or activities[0] == "":
            response_data["success"] = "false"
            response_data["message"] = "At least one activity must be assigned."
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        # Create list of activity_ids from names
        activity_ids = []
        for i, activity in enumerate(activities):
            activity_object = Activity.objects.filter(name=activity)
            activity_id = activity_object[0].id
            activity_ids.append(activity_id)

        # INPUT - assigned_users
        assigned_users_emails = request.POST.getlist("assigned_users[]", "")

        # EDIT ROLE - Name
        if role_name != "":
            if role.name != role_name:
                role.name = role_name
                role.save()

        # EDIT ROLE - Activities
        # Remove any currently assigned activities not in new assigned_activites list
        activities_currently_assigned = role.activities.all()
        for activity_currently_assigned in activities_currently_assigned:
            if activity_currently_assigned.id not in activity_ids:
                role.activities.remove(activity_currently_assigned.id)
                role.save()
        # Add activities in new assigned_activites list
        for activity_id in activity_ids:
            role.activities.add(activity_id)
            role.save()

        # EDIT ROLE - Users assigned to this role
        # Loop through all users. Should each be assigned this role? Or not?
        all_users = User.objects.all()
        for user in all_users:
            if user.email in assigned_users_emails:
                user.roles.add(int(role_id))
                user.save()
            else:
                user.roles.remove(int(role_id))
                user.save()

        # RETURN - boolean
        response_data["success"] = "true"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('delete role')
def api_delete_role(request, role_id=0):
    """
    POST /manage-users/api/roles/delete/NUMBER
    Deletes a role

    Inputs:
    :role_id:                   id of role

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "DELETE":
        response_data["success"] = "false"
        response_data["message"] = "DELETE method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    else:
        company = get_company_or_404(request)

        # Check if role exists
        if Role.objects.filter(id=role_id).exists() == False:
            response_data["success"] = "false"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # Check that company manages this role and can therefore delete it
        company_id_to_delete = Role.objects.filter(id=role_id)[0].company.id
        if company.id != company_id_to_delete:
            response_data["success"] = "false"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        Role.objects.filter(id=role_id).delete()
        if Role.objects.filter(id=32).exists() == False:
            response_data["success"] = "true"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        response_data["success"] = "false"
        response_data["message"] = "Role not deleted."
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('read user')
def api_get_users(request):
    """
    GET /manage-users/api/users/
    Retrieves all users associated with a company
    """

    response_data = {}

    company = get_company_or_404(request)

    # Retrieve users already assigned to roles associated with this company
    users_available = []
    roles = Role.objects.filter(company=company)
    for role in roles:
        role_id_temp = role.id
        users = User.objects.filter(roles__id=role_id_temp)
        for user in users:
            if user not in users_available:
                users_available.append(user)

    # Build JSON response
    for user in users_available:

        response_data[user.id] = {}

        # Email
        response_data[user.id]["email"] = user.email

        # Roles
        roles_assigned_to_this_user = user.roles.all()
        response_data[user.id]["roles"] = serializers.serialize("json", roles_assigned_to_this_user, fields=('name'))

        # TODO Do assigned roles and available roles, I use this on front end


        # Status
        # TODO: This is NOT the same as status
        # Waiting on email invitation work
        response_data[user.id]["status"] = user.is_verified

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('read user')
def api_get_specific_user(request, user_id=0):
    """
    GET /manage-users/api/users/NUMBER
    Retrieves specific user
    """

    response_data = {}

    company = get_company_or_404(request)

    user = User.objects.filter(id=user_id)

    # Check if user exists
    if user.exists() == False:
        response_data["success"] = "false"
        response_data["message"] = "User does not exist."
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    # Check if the editor has the right to edit this user (i.e. is the user affiliated with any of the current company's roles?)
    ## List current company's roles
    current_companys_roles = Role.objects.filter(company=company)
    ## List user's roles
    roles_assigned_to_this_user = user[0].roles.all()
    ## Overlap?
    if bool(set( current_companys_roles ) & set( roles_assigned_to_this_user)) == "False":
        response_data["success"] = "false"
        response_data["message"] = "You do not have permission to view this user"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

    # Return user
    response_data[user[0].id] = {}

    # Email
    response_data[user[0].id]["email"] = user[0].email

    # Available Roles (constrained by company)
    response_data[user[0].id]["roles"] = {}
    available_roles = Role.objects.filter(company=company)
    response_data[user[0].id]["roles"]["available"] = serializers.serialize("json", available_roles)

    # Assigned Roles
    roles_assigned_to_this_user = user[0].roles.all()
    response_data[user[0].id]["roles"]["assigned"] = serializers.serialize("json", roles_assigned_to_this_user, fields=('name'))

    # Status
    # TODO: This is NOT the same as status
    # Waiting on email invitation work
    response_data[user[0].id]["status"] = user[0].is_verified

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('create user')
def api_create_user(request):
    """
    POST /manage-users/api/user/create
    Creates a new user

    Inputs:
    :user_email:                user email
    :assigned_roles:            roles assigned to this user

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "POST":
        response_data["success"] = "false"
        response_data["message"] = "POST method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        company = get_company_or_404(request)

        if request.POST.get("user_email", ""):
            user_email = request.POST['user_email']

        matching_users = User.objects.filter(email=user_email)
        if matching_users.exists():
            # TODO This user is already in the system. Email the user an invitation to accept this role.
            response_data["success"] = "false"
            response_data["message"] = "This user already exists. Role invitation email sent."
            return HttpResponse(json.dumps(response_data), content_type="application/json")
            # TODO If they accept, add them to the role(S)

        role_ids = []
        if request.POST.getlist("assigned_roles[]", ""):
            roles = request.POST.getlist("assigned_roles[]", "")
            # Create list of role_ids from names
            for i, role in enumerate(roles):
                role_object = Role.objects.filter(name=role)
                role_id = role_object[0].id
                role_ids.append(role_id)
        # At least one role must be selected
        if not role_ids:
            response_data["success"] = "false"
            response_data["message"] = "Each user must be assigned to at least one role."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # Create User
        new_user, created = User.objects.create_user(email=user_email)
        if created:
            # Assign roles to this user
            new_user.roles.add(*role_ids)
            response_data["success"] = "true"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        response_data["success"] = "false"
        response_data["message"] = "User not created."
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('update user')
def api_edit_user(request, user_id=0):
    """
    POST /manage-users/api/users/edit
    Edits an existing user

    Inputs:
    :user_id:                   unique id of user
    :assigned_roles:            roles assigned to this role

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "POST":
        response_data["success"] = "false"
        response_data["message"] = "POST method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        company = get_company_or_404(request)

        user = User.objects.filter(id=user_id)

        # Check if user exists
        if user.exists() == False:
            response_data["success"] = "false"
            response_data["message"] = "User does not exist."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # Check if the editor has the right to edit this user (i.e. is the user affiliated with any of the current company's roles?)
        ## List current company's roles
        current_companys_roles = Role.objects.filter(company=company)
        ## List user's roles
        roles_assigned_to_this_user = user[0].roles.all()
        ## Overlap?
        if bool(set( current_companys_roles ) & set( roles_assigned_to_this_user)) == "False":
            response_data["success"] = "false"
            response_data["message"] = "You do not have permission to edit this user"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # INPUT - assigned_roles
        assigned_roles = request.POST.getlist("assigned_roles[]", "")

        # Check that at least one role is selected
        if assigned_roles == "" or assigned_roles[0] == "":
            response_data["success"] = "false"
            response_data["message"] = "A user must be assigned to at least one role."
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        # Update the user

        # Create list of assigned_roles_ids from role names
        assigned_roles_ids = []
        for i, role in enumerate(assigned_roles):
            role_object = Role.objects.filter(name=role)
            role_id = role_object[0].id
            assigned_roles_ids.append(role_id)

        # Add new roles to user
        for assigned_role in assigned_roles_ids:
            user[0].roles.add(assigned_role)

        # Remove roles from user if not in new list
        for currently_assigned_role in user[0].roles.all():
            if currently_assigned_role.id not in assigned_roles_ids:
                user[0].roles.remove(currently_assigned_role.id)

        # # RETURN - boolean
        response_data["success"] = "true"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@staff_member_required
@requires('delete user')
def api_delete_user(request, user_id=0):
    """
    DELETE /manage-users/api/users/delete/NUMBER
    Removes user from roles managed by current company

    Inputs:
    :user_id:                   id of user

    Returns:
    :success:                   boolean
    """

    response_data = {}

    if request.method != "DELETE":
        response_data["success"] = "false"
        response_data["message"] = "DELETE method required."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        company = get_company_or_404(request)

        user = User.objects.filter(id=user_id)

        # Check if user exists
        if user.exists() == False:
            response_data["success"] = "false"
            response_data["message"] = "User does not exist."
            return HttpResponse(json.dumps(response_data), content_type="application/json")


        roles = Role.objects.filter(company=company)
        for role in roles:
            user[0].roles.remove(role.id)

        response_data["success"] = "true"
        response_data["message"] = "User deleted."
        return HttpResponse(json.dumps(response_data), content_type="application/json")
