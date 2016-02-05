from mysearches.views import (secure_saved_search,
                              get_value_from_request,
                              add_or_activate_saved_search,
                              user_creation_retrieval)

from myjobs.tests.setup import MyJobsBase

class SecureSavedSearchAPITestCase(MyJobsBase):
    """
    Test cases for secure saved search API (currently used by secure blocks
    saved search widget

    """
    def test_add_or_activate_function_adds_search(self):
        """
        Test to ensure the add_or_activate_saved_search function adds a search
        when provided a user and an valid URL of a search that user does not
        have

        """

    def test_add_or_activate_function_activates_search(self):
        """
        Test to ensure the add_or_activate_saved_search function adds a search
        when provided a user and an valid URL of a search that user has and is
        inactive

        """

    def test_add_or_activate_function_invalid_url(self):
        """
        Test to ensure the add_or_activate_saved_search function raises
        the proper exception if an invalid url is provided

        """

    def test_add_or_activate_function_no_url(self):
        """
        Test to ensure the add_or_activate_saved_search function raises
        proper exception if no url is provided

        """

    def test_request_function_retrieves_post_value(self):
        """
        Test to ensure that get_value_from_request retrieves a value when
        given a key in the POST values

        """

    def test_request_function_retrieves_get_value(self):
        """
        Test to ensure that get_value_from_request retrieves a value when
        given a key in the GET values

        """

    def test_request_function_retrieves_body_value(self):
        """
        Test to ensure that get_value_from_request retrieves a value when
        given a key in the body values (JSON formatted)

        """

    def test_request_function_returns_none_if_key_doesnt_exist(self):
        """
        Test to ensure that get_value_from_request retrieves a key isn't in
        body, POST or GET

        """

    def test_return_user_if_exists_and_is_logged_in(self):
        """
        Verifies that if the email provided belongs to the authenticated user,
        that user's account is returned from user_creation_retrieval

        """

    def test_return_user_if_email_not_taken(self):
        """
        Verifies that if an unused email is provided, a user is created for
        that user and it is returned by user_creation_retrieval

        """

    def test_return_user_if_exists_and_is_logged_in(self):
        """
        Verifies that if the email provided belongs to the authenticated user,
        that user's account is returned from user_creation_retrieval

        """

    def test_raise_error_if_email_is_taken(self):
        """
        Verifies that if the email provided belongs to a user that is not
        signed in, an error is raised from user_creation_retrieval

        """

    def test_raise_error_if_email_is_already_taken(self):
        """
        Verifies that if the email provided belongs to a user that is not
        signed in, an error is raised from user_creation_retrieval

        """

    def test_email_and_auth_user_are_required(self):
        """
        Verifies that the function only works if both auth user and email are
        provided to user_creation_retrieval

        """