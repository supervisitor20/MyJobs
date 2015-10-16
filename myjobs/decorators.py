from functools import wraps

from django.contrib.auth import logout
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponseRedirect, HttpResponseForbidden
from django.shortcuts import get_object_or_404

from myjobs.models import User, Activity, AppAccess 
from universal.helpers import get_company_or_404


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

            # Everything passed; Continue to the desired view
            return view_func(request, *args, **kwargs)
        return wraps(view_func)(wrap)
    return decorator

class MissingAppAccess(HttpResponseForbidden):
    """
    MissingAppAccess is raised when a company user access a view but that
    company doesn't have the app access required for that view. It is no
    different than an HttpResponseForbidden, other than it's name, which we can
    use to assert that the correct response type was returned without leaking
    information to the user.
    """


class MissingActivity(HttpResponseForbidden):
    """
    MissingActivity is raised when a company user access a view but that
    user hasn't been assigned roles which include the required activities. It
    is no different than an HttpResponseForbidden, other than it's name, which
    we can use to assert that the correct response type was returned without
    leaking information to the user.
    """


def requires(activities, activity_callback=None, access_callback=None):
    """
    Protects a view by activity and app access, optionally invoking callbacks.

    This decorator determines from the list of passed in :activities: what app
    access is needed to continue processing the decorated view. If the user
    belongs to a company who doesn't have the right app access, a
    `MissingAppAccess` response is returned. If the company has the right app
    access but the user's roles don't include the enumerated activities, a
    `MissingActivity` response is returned instead. If both activities and app
    access constraints are met, the decorated view is processed as normal.

    `MissingAppAccess` and `MissingActivity` are simply aliases for
    `HttpResponseForbidden'. They are made distinct so that in testing the
    reason for a 403 response is clearer, without actually having to leak
    information back to the user.

    Inputs:
    :activities: A list of activity names that the decorated view should
                   check against.
    :activity_callback: A callable to be used as the view response when the
                        user isn't associated with the correct subset of
                        activities.
    :access_callback: A callable to be used as the view response when the
                      user's company doesn't have the appropriate app access
                      (as determined by the passed in activities).

    Examples:
    Let's assume that the activities "create user", "read user", "update user",
    and "delete user" exist with an app access of "User Management". Let us
    further assume that a `modify_user` view exists. Finally, lets assume that
    the current user belongs to a company, `TestCompany`. We might want to
    decorate that view as follows:

        @requires(["read user", "update user"])
        def modify_user(request):
            ...

    If `TestCompany` doesn't have access to "User Management", then attempting
    to navigate to `modify_user` would result in a `MissingAppAccess` response.
    If that company does have "User Management" access, but the user's roles
    don't include both the "read user" and "update user" activities, a
    `MissingActivity` response would returned instead. If both conditions are
    met, the `modify_user` view will proceed as though it weren't decorated at
    all.

    If a `MissingActivity` response is insufficient (because you want to give
    the user some useful information) you may additionally pass an
    `activity_callback`, which will return the appropriate response:

        def callback():
            return HttpResponse("<strong>Insufficient permissions. "
                                "Please contact your administrator</strong>")

        @requires(["read user", "update user"], activity_callback=callback)
        def modify_user(request):
            ...

    In this case, the user will see the appropriate message in bold, with a
    status code of 200. A similar strategy can be used for customizing the
    response used when app access is missing by passing `access_callback`.
    """

    activity_callback = activity_callback or MissingActivity
    access_callback = access_callback or MissingAppAccess

    def decorator(view_func):
        @wraps(view_func)
        def wrap(request, *args, **kwargs):
            company = get_company_or_404(request)
            # the app_access we have, determined by the current company
            company_access = company.app_access.values_list('name', flat=True)
            user_activities = request.user.roles.values_list(
                'activities__name', flat=True)

            # the app_access we need, determined by the activities passed in
            required_access = AppAccess.objects.filter(
                activity__name__in=activities).values_list(
                    'name', flat=True)

            # company should have at least the access required by the view
            if not bool(company_access) or not set(required_access).issubset(
                    company_access):
                return access_callback()
            # the user should have at least the activities required by the view
            elif not bool(user_activities) or not set(activities).issubset(
                    user_activities):
                return activity_callback()
            else:
                return view_func(request, *args, **kwargs)

        return wrap
    return decorator
