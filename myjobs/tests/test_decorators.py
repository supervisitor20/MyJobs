"""Tests the decorators in the myjobs app."""

from django.test import RequestFactory
from django.conf import settings
from django.http import HttpResponse, Http404

from myjobs.tests.setup import MyJobsBase
from myjobs.tests.factories import (AppAccessFactory, UserFactory,
                                    ActivityFactory, RoleFactory)
from myjobs.decorators import requires, MissingAppAccess, MissingActivity
from seo.tests.factories import CompanyFactory, CompanyUserFactory


def dummy_view(request):
    """View used during various decorator tests."""
    return HttpResponse(request.user.email)


# TODO: remove this when the feature goes live
class DecoratorTests(MyJobsBase):
    """Tests that the various decorators in MyJobs work as expected."""

    def setUp(self):
        super(DecoratorTests, self).setUp()
        # admin role gets updated with all activities, which defeats the
        # purpose of these tests
        self.role.name = "Test Role"
        self.role.save()
        self.activity = ActivityFactory(app_access=self.app_access)
        self.role.activities.add(self.activity)

        factory = RequestFactory()
        self.request = factory.get("/test")
        self.request.user = self.user

    def test_accessing_a_view_with_proper_permissions(self):
        """
        If a user tries to access a page for which his company has access and
        that user's roles include the denoted activities, they should be
        allowed to visit that page.
        """

        response = requires(self.activity.name)(dummy_view)(self.request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, self.user.email)

    def test_company_with_wrong_app_access(self):
        """
        When a company doesn't have the right app-level access, a user
        shouldn't see that app's view, even if that user has a role with the
        right activities.
        """

        self.company.app_access.clear()
        response = requires(self.activity.name)(dummy_view)(self.request)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(type(response), MissingAppAccess)

    def test_access_callback(self):
        """
        When app access is sufficient and a callback is supplied, the response
        of that callback should be returned rather than a `MissingAppAccess`
        response.
        """

        self.company.app_access.clear()

        def callback(request):
            raise Http404("This app doesn't exist.")

        with self.assertRaises(Http404) as cm:
            response = requires(
                self.activity.name,
                access_callback=callback)(dummy_view)(self.request)

        self.assertEqual(cm.exception.message, "This app doesn't exist.")

    def test_activity_callback(self):
        """
        When app access is sufficient and a callback is supplied, the response
        of that callback should be returned rather than a `MissingAppAccess`
        response.
        """

        self.user.roles.first().activities.clear()

        def callback(request):
            raise Http404("Required activities missing.")

        with self.assertRaises(Http404) as cm:
            response = requires(
                self.activity.name,
                activity_callback=callback)(dummy_view)(self.request)

        self.assertEqual(cm.exception.message, "Required activities missing.")

    def test_invalid_callback(self):
        """
        When an invalid callback is declared, we should see an error.
        """

        def callback(request):
            raise Http404("Required activities missing.")

        with self.assertRaises(TypeError) as cm:
            response = requires(
                self.activity.name,
                # we misspelled access here, so the callback is invalid
                acess_callback=callback)(dummy_view)(self.request)

        # the erroneous callback should be listed in the output
        self.assertIn("- acess_callback", cm.exception.message)

    def test_user_with_wrong_activities(self):
        """
        When a user's roles don't include all of the activities required by a
        view, they should see a permission denied error.
        """

        self.user.roles.first().activities.clear()
        response = requires(self.activity.name)(dummy_view)(self.request)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(type(response), MissingActivity)

    def test_user_with_wrong_number_of_activities(self):
        """
        A user's roles should have all activities required by a decorated view,
        not just a subset of them.
        """

        activity = ActivityFactory(app_access=self.app_access)
        response = requires(
            self.activity.name, activity.name)(dummy_view)(self.request)

        self.assertEqual(response.status_code, 403)
        self.assertEqual(type(response), MissingActivity)

    def test_user_with_extra_activities(self):
        """
        A user should be able to access a view even if the roles include
        activities not required by the view.
        """

        activity = ActivityFactory(app_access=self.app_access)
        self.role.activities.add(activity)
        response = requires(self.activity.name)(dummy_view)(self.request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, self.user.email)
