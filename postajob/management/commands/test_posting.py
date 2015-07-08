import imp
import os

from selenium import webdriver

from django.conf import settings
from django.core.management.base import NoArgsCommand
from django.utils import unittest
from django.utils.unittest.case import TestCase

from myjobs.models import User
from seo.models import Company, CompanyUser, SeoSite
from seo.tests import patch_settings


class Command(NoArgsCommand):
    def handle_noargs(self, **options):
        suite = unittest.TestLoader().loadTestsFromTestCase(JobPostingTests)
        unittest.TextTestRunner().run(suite)


def make_user(admin=False):
    if admin:
        address = 'paj_admin@my.jobs'
        method = 'create_superuser'
    else:
        address = 'paj_user@my.jobs'
        method = 'create_user'
    user = getattr(User.objects, method)(email=address, send_email=False)
    password = User.objects.make_random_password()
    if isinstance(user, tuple):
        # User.objects.create_user returns (User, created).
        user = user[0]
    # It is less of a headache to set the password now and toggle
    # password_change than it is to pass password into the user creation call,
    # determine if the password was set or if we short-circuited, and then act
    # on that determination.
    user.set_password(password)
    user.password_change = False
    user.save()
    user.raw_password = password
    return user


class JobPostingTests(TestCase):
    OVERRIDES = {}
    CREATION_ORDER = []
    test_url = 'localhost'
    test_port = ''

    @classmethod
    def setup_objects(cls):
        cls.admin = make_user(True)
        # I'm appending after every db write rather than at the very end
        # so we can roll back all previous successes if any transaction fails.
        cls.CREATION_ORDER.append(cls.admin)
        cls.user = make_user(False)
        cls.CREATION_ORDER.append(cls.user)

        cls.owning_company = Company.objects.create(
            name='Postajob Selenium Company',
            company_slug='postajob-selenium-company',
            member=True, product_access=True, posting_access=True)
        cls.CREATION_ORDER.append(cls.owning_company)
        cls.owning_company_user = CompanyUser.objects.create(
            company=cls.owning_company, user=cls.admin)
        cls.CREATION_ORDER.append(cls.owning_company_user)

        cls.seo_site = SeoSite.objects.create(domain='selenium.jobs',
                                              name='Selenium Jobs')
        cls.CREATION_ORDER.append(cls.seo_site)

    @classmethod
    def login(cls, user):
        path = '/admin/'
        cls.get(path=path)
        cls.browser.find_element_by_id('id_username').send_keys(user.email)
        cls.browser.find_element_by_id('id_password').send_keys(
            user.raw_password)
        cls.browser.find_element_by_xpath('//input[@value="Log in"]').click()

    @classmethod
    def post(cls, path='/', data=None, domain=None):
        data = data or {}
        requested_url = 'http://{domain}{port}{path}'.format(
            domain=cls.test_url, port=cls.test_port, path=path)
        if domain:
            requested_url += '?domain=%s' % domain
        cls.browser.post(requested_url, data=data)

    @classmethod
    def get(cls, path='/', domain=None):
        requested_url = 'http://{domain}{port}{path}'.format(
            domain=cls.test_url, port=cls.test_port, path=path)
        if domain:
            requested_url += '?domain=%s' % domain
        cls.browser.get(requested_url)

    @classmethod
    def setUpClass(cls):
        environment = os.environ.get('SETTINGS', '').lower()
        if environment == 'qc':
            print 'Running test_posting with QC settings'
            cls.test_url = 'qc.www.my.jobs'
            qc = imp.load_source('settings.myjobs_qc',
                                 'deploy/settings.myjobs_qc.py')
            cls.OVERRIDES = vars(qc)
        elif environment == 'staging':
            print 'Running test_posting with staging settings'
            cls.test_url = 'staging.www.my.jobs'
            staging = imp.load_source('settings.myjobs_staging',
                                      'deploy/settings.myjobs_staging.py')
            cls.OVERRIDES = vars(staging)
        else:
            assert getattr(settings, 'ENVIRONMENT') != 'Production', \
                'Running test_posting with production settings is unsupported'
            print 'Running test_posting with settings.py'
            cls.test_port = ':8000'
        cls.browser = webdriver.PhantomJS()
        super(JobPostingTests, cls).setUpClass()

        with patch_settings(**cls.OVERRIDES):
            cls.setup_objects()

    @classmethod
    def tearDownClass(cls):
        cls.browser.quit()
        with patch_settings(**cls.OVERRIDES):
            for obj in cls.CREATION_ORDER[::-1]:
                obj.delete()
        super(JobPostingTests, cls).tearDownClass()

    def test_show_job_admin(self):
        with patch_settings(**self.OVERRIDES):
            print settings.ENVIRONMENT
            import ipdb; ipdb.set_trace()
            pass
