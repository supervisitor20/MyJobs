import imp
import os

from selenium import webdriver

from django.conf import settings
from django.core.management.base import NoArgsCommand
from django.utils import unittest
from django.utils.unittest.case import TestCase

from myjobs.models import User
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
    return user, password


class JobPostingTests(TestCase):
    OVERRIDES = {}

    @classmethod
    def setUpClass(cls):
        cls.test_url = 'localhost:8000'
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
        cls.browser = webdriver.PhantomJS()
        super(JobPostingTests, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.browser.quit()
        super(JobPostingTests, cls).tearDownClass()

    def test_show_job_admin(self):
        with patch_settings(**self.OVERRIDES):
            print settings.ENVIRONMENT
            print make_user()
            print make_user(True)
