""" Functional Tests for My.jobs
    These tests are meant to test My.jobs functionality at a high-level. As
    such, they are written such that they test user expectations, rather than
    specific functionality.
"""
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from myjobs.tests.factories import UserFactory
from django.test import LiveServerTestCase
from django.test.utils import override_settings
from selenium import webdriver


@override_settings(DEBUG=True)
class SeleniumTestCase(LiveServerTestCase):

    """ Adds Selenium to LiveServerTestCase. """

    @classmethod
    def setUpClass(cls):
        cls.browser = webdriver.PhantomJS()
        cls.browser.set_window_size(1120, 550)
        super(SeleniumTestCase, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.browser.quit()
        super(SeleniumTestCase, cls).tearDownClass()

    def find(self, id_=None, **kwargs):
        """
        Convenience method which dispatches to selenium's find_element_by_*
        methods. Since searching by ID is the common case, it is the sole
        positional argument. Searching by name or xpath can be done by passing
        their respective keyword arguments.
        """
        name = kwargs.pop('name', None)
        xpath = kwargs.pop('xpath', None)

        if id_:
            return self.browser.find_element_by_id(id_)
        elif name:
            return self.browser.find_element_by_name(name)
        elif xpath:
            return self.browser.find_element_by_xpath(xpath)


class NewUserTests(SeleniumTestCase):

    """Tests Account creation"""

    def setUp(self):
        super(NewUserTests, self).setUp()
        self.user = UserFactory(first_name="John", last_name="Doe")

    def test_home_page_works(self):
        """
        As John, navigating to https://secure.my.jobs should send me to a page
        titled "My.jobs".
        """
        self.browser.get(self.live_server_url)
        self.assertIn(self.browser.title, 'My.jobs')

    def test_cant_log_in_without_account(self):
        """
        As John, I shouldn't be able to log into My.jobs without registering
        first.
        """
        self.browser.get('/'.join([self.live_server_url, 'prm', 'view']))

        # We're trying to access a private page while unauthenticated, which
        # should result in a next parameter being added.
        self.assertTrue('next=' in self.browser.current_url)

        # attempt to log in
        username = self.find('id_username')
        username.send_keys(self.user.email)
        self.find('id_password').send_keys(self.user.password)
        self.find('login').click()

        # If we've logged in, the next parameter should have went away. We
        # aren't expecting to be logged in right now as the password was bad.
        self.assertTrue('next=' in self.browser.current_url)

    def test_user_registration(self):
        """
        As John, I should be able to register on My.jobs and log in.
        """
        self.browser.get('/'.join([self.live_server_url, 'prm', 'view']))

        # register
        self.find('id_email').send_keys('foobar1@baz.com')
        self.find('id_password1').send_keys('aaAA11..')
        self.find('id_password2').send_keys('aaAA11..')
        self.find('register').click()

        try:
            WebDriverWait(self.browser, 10).until(
                expected_conditions.presence_of_element_located(
                    (By.ID, 'profile')))
        finally:
            self.assertEqual(self.find('profile').get_attribute(
                'innerHTML'),
                'Skip: Take me to my profile')

    def test_user_login(self):
        self.user.set_password("test")
        self.user.save()
        self.find('id_username').send_keys(self.user.email)
        self.find('id_password').send_keys("test")
        self.find('login').click()


class NormalUserTests(SeleniumTestCase):

    """Tests PRM navigation for existing Users"""
