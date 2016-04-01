from functools import wraps

from django.contrib.auth import logout
from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponseForbidden, Http404
from django.shortcuts import get_object_or_404

from myjobs.models import User, AppAccess
from universal.helpers import (get_company_or_404, get_company, every)


def user_is_allowed(model=None, pk_name=None, pass_user=False):
    """
    Determines if the currently logged in user should be accessing the
    decorated view

    Expects that the query string contains a :verify-email: key if the
    request originates from a My.jobs email; The user using this address
    is added to the view's kwargs as :user: if :pass_user: is True. If the
    user is not anonymous, passing :verify-email: will ensure that the user
    owns that address.

    Inputs:
    :model: Optional; Model class that the user is trying to access
    :pk_name: Optional; Name of the id parameter being passed to
        the decorated view
    :pass_user: Optional; Denotes whether or not the email's owner should be
        passed to the decorated view

    Outputs:
    :response: Http404 or the results of running the decorated view

    GET Parameters:
    :verify-email: Optional; User's primary email; Ensures that an individual
        is authorized to access a logged in user's information
    :verify: Optional; User's user_guid.
    """
    def decorator(view_func):
        def wrap(request, *args, **kwargs):
            email = request.GET.get('verify-email', '')
            guid = request.GET.get('verify', '')
            user = None
            if request.user.is_anonymous() and not email and not guid:
                path = request.path
                qs = request.META.get('QUERY_STRING')
                next_url = request.get_full_path()
                return HttpResponseRedirect(reverse('login')+'?next='+next_url)

            if email:
                user = User.objects.get_email_owner(email)
                if not user:
                    # :verify-email: was provided but no user exists
                    # Log out the user and redirect to login page
                    logout(request)
                    return HttpResponseRedirect(reverse('login'))
            elif guid:
                try:
                    user = User.objects.get(user_guid=guid)
                except User.DoesNotExist:
                    logout(request)
                    return HttpResponseRedirect(reverse('login'))

            if not request.user.is_anonymous():
                if user:
                    if request.user != user:
                        # If the currently logged in user doesn't own the
                        # provided email address, log out the user and
                        # redirect to login page
                        logout(request)
                        return HttpResponseRedirect(reverse('login'))
                else:
                    # If user was not set previously, set it to the currently
                    # logged in user.
                    user = user or request.user

            if pass_user:
                # If :pass_user: is provided, the email address owner should be
                # passed to the decorated view.
                kwargs['user'] = user

            if pk_name:
                pk = request.REQUEST.get(str(pk_name))
                if pk:
                    try:
                        pk = int(pk)
                        # If the current user doesn't own the requested object
                        # or said object does not exist, redirect to 404 page
                        obj = get_object_or_404(model.objects,
                                                user=user,
                                                id=pk)
                    except ValueError:
                        # The value may not be an int; Saved searches, for
                        # example, pass 'digest' when working with digests
                        pass
                    except TypeError:
                        return HttpResponseForbidden()

            # Everything passed; Continue to the desired view
            return view_func(request, *args, **kwargs)
        return wraps(view_func)(wrap)
    return decorator

CALLBACK_ERROR_TEMPLATE = """\
Received invalid callbacks:
{callbacks}
Expected "access_callback" and/or "activity_callback".
"""


class MissingActivity(HttpResponseForbidden):
    """
    MissingActivity is raised when a company user access a view but that
    user hasn't been assigned roles which include the required activities. It
    is no different than an HttpResponseForbidden, other than it's name, which
    we can use to assert that the correct response type was returned without
    leaking information to the user.
    """


# TODO: See if I can rewrite requires in terms of User.can
def requires(*activities, **callbacks):
    """
    Protects a view by activity and app access, optionally invoking callbacks.

    This decorator determines from the list of passed in :activities: what app
    access is needed to continue processing the decorated view. If the user
    belongs to a company who doesn't have the right app access, a response is
    returned. If the company has the right app access but the user's roles
    don't include the enumerated activities, a `MissingActivity` response is
    returned instead. If both activities and app access constraints are met,
    the decorated view is processed as normal.

    `MissingActivity` is simply an alias for `HttpResponseForbidden'. They are
    made distinct so that in testing the reason for a 403 response is clearer,
    without actually having to leak information back to the user.

    Inputs:
    :activities: A list of activity names that the decorated view should
                   check against.
    :callbacks: callbacks['activity_callback'] is a callable to be used as a
                view response when the use isn't associated with the correct
                subset of activities.

                callbacks['access_callback'] is a callable to be used as a view
                response when the users's company doesn't have the appropriate
                app access (as determined by the passed in activities).

                Both callbacks take a `request` parameter which can be used to
                do further processing before returning an alternate result.

                callbacks['compare'] is the callable used to compare the
                requested activities with those a user has access to. Uses
                `universal.helpers.every` by default, which returns True if the
                two iterables are identical.

                This callback takes two iterables and returns a boolean
                signifying whether or not the comparison was successful. See
                universal.decorators for more built-in compare functions.

    Examples:
    Let's assume that the activities "create user", "read user", "update user",
    and "delete user" exist with an app access of "User Management". Let us
    further assume that a `modify_user` view exists. Finally, lets assume that
    the current user belongs to a company, `TestCompany`.

    We might want to decorate that view as follows::

        @requires("read user", "update user")
        def modify_user(request):
            ...

    If `TestCompany` doesn't have access to "User Management", then attempting
    to navigate to `modify_user` would result in an `Http404` response.  If
    that company does have "User Management" access, but the user's roles don't
    include both the "read user" and "update user" activities, a
    `MissingActivity` response would returned instead. If both conditions are
    met, the `modify_user` view will proceed as though it weren't decorated at
    all.

    If a `MissingActivity` response is insufficient (because you want to give
    the user some useful information) you may additionally pass an
    `activity_callback`, which will return the appropriate response::

        def callback(request):
            return HttpResponse("<strong>Insufficient permissions. "
                                "Please contact your administrator</strong>")

        @requires("read user", "update user", activity_callback=callback)
        def modify_user(request):
            ...

    In this case, the user will see the appropriate message in bold, with a
    status code of 200. A similar strategy can be used for customizing the
    response used when app access is missing by passing `access_callback`.

    An example of when the compare callback is useful is when we only care if a
    user has at least one of the specified activities, such as might be the
    case on an admin overview page. Thus, we might decorate our view as
    follows::

        @requires("read product", "read grouping", compare=at_least_one)
        def admin_overview(request):
            ...

    """
    invalid_callbacks = set(callbacks.keys()).difference({
        "access_callback", "activity_callback", "compare"})

    if invalid_callbacks:
        raise TypeError(CALLBACK_ERROR_TEMPLATE.format(callbacks="\n".join(
            "- {0}".format(callback) for callback in invalid_callbacks)))

    def access_callback(request):
        """
        Default callback used when appropriate app-level access isn't
        found.

        """
        company = get_company(request)
        raise Http404("%s doesn't have sufficient app-level access." % (
            company.name))

    access_callback = callbacks.get(
        'access_callback', access_callback)
    activity_callback = callbacks.get(
        'activity_callback', lambda request: MissingActivity())

    compare = callbacks.get('compare', every)

    def decorator(view_func):
        @wraps(view_func)
        def wrap(request, *args, **kwargs):
            invalid_user = any([not request.user, not request.user.pk,
                                request.user.is_anonymous()])

            if invalid_user:
                path = request.path
                qs = request.META.get('QUERY_STRING')
                next_url = request.get_full_path()

                return HttpResponseRedirect(reverse('login')+'?next='+next_url)

            # get_company isn't reliable, see PD-2260 on JIRA
            company = get_company_or_404(request)

            # the app_access we need, determined by the activities passed in
            required_access = filter(bool, AppAccess.objects.filter(
                activity__name__in=activities).values_list(
                    'name', flat=True).distinct())

            # company should have at least the access required by the view
            has_access = set(required_access).issubset(company.enabled_access)

            # the user should have at least the activities required by the view
            has_activities = compare(
                activities, request.user.get_activities(company))

            if not has_access:
                return access_callback(request)
            elif not has_activities:
                return activity_callback(request)
            else:
                return view_func(request, *args, **kwargs)

        return wrap
    return decorator
