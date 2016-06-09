import json
from os import path

from django.conf import settings
from django.core.urlresolvers import reverse

from myjobs.tests.factories import UserFactory
from myjobs.tests.setup import MyJobsBase

from redirect.models import DestinationManipulation


class SourceCodeUploadTests(MyJobsBase):
    def setUp(self):
        super(SourceCodeUploadTests, self).setUp()
        self.user.set_password('secret')
        self.client.login(username=self.user.email,
                          password='secret')
        self.path = 'automation/tests/spreadsheets/%s/%s.xlsx'

    def test_good_file_parsing(self):
        files = [
            ('one_row', 1), ('one_row_two_vs', 2), ('one_row_multiple_vs', 3)
        ]
        self.assertEqual(DestinationManipulation.objects.count(), 0)
        for file_name, num_added in files:
            with open(self.path % ('good', file_name)) as fp:
                self.client.post(reverse('source_code_upload'),
                                 {'source_code_file': fp,
                                  'buids': [1],
                                  'source_code_parameter': 'src'})
                self.assertEqual(DestinationManipulation.objects.count(),
                                 num_added)
                values = DestinationManipulation.objects.values_list(
                    'view_source', 'value_1')

                # The spreadsheets are defined as having a view source of 1-3
                # inclusive; This should be good enough to ensure they are all
                # valid
                self.assertTrue(
                    set([value[0] for value in values]).issubset(
                        {1, 2, 3}))

                # The spreadsheets tested all contain the same source code;
                # there should only be one distinct source code value in the
                # database
                self.assertEqual(set([value[1] for value in values]),
                                 {'?src=DE-SC'})
                DestinationManipulation.objects.all().delete()

    def test_bad_file_parsing(self):
        self.assertEqual(DestinationManipulation.objects.count(), 0)
        with open(self.path % ('bad', 'invalid_rows')) as fp:
            self.client.post(reverse('source_code_upload'),
                             {'source_code_file': fp,
                              'buids': [1],
                              'source_code_parameter': 'src'})

        self.assertEqual(DestinationManipulation.objects.count(), 0)

    def test_non_staff_user(self):
        self.client.logout()
        user = UserFactory(email='random@example.com')
        user.set_password('secret')
        self.client.login(username=user.email, password='secret')
        response = self.client.get(reverse('source_code_upload'))
        self.assertTrue('Log in' in response.content)

    def test_integer_source_codes(self):
        with open(self.path % ('good', 'digits')) as fp:
            self.client.post(reverse('source_code_upload'),
                             {'source_code_file': fp,
                              'buids': [1],
                              'source_code_parameter': 'src'})

        dm = DestinationManipulation.objects.get()
        # xlrd converts integer values to floating point when pulling from
        # a spreadsheet. So far, float source codes are not used; ensure
        # numeric source codes are handled as ints
        value = dm.value_1.split('=')[1]

        # If this is parsed as a float, int(value) will raise a ValueError
        int_value = int(value)

    def test_autoupdate_view_sources_on_upload(self):
        """
        Tests that we correctly add source codes to all applicable view sources
        when we process a spreadsheet.
        """
        with open(path.join(settings.PROJ_ROOT,
                            'jsondata/view_source_conversion.json')) as f:
            conversion = json.load(f)
        view_sources = [int(vs) for vs in conversion['Indiana State Job Bank']]
        self.assertTrue(len(view_sources) > 1)
        buid = 1
        for manipulations in [[], [DestinationManipulation(
                              action_type=1, buid=buid, action='sourcecodetag',
                              value_1='?src=JB-0000',
                              view_source=view_sources[0])]]:
            [manipulation.save() for manipulation in manipulations]

            with open(self.path % ('good', 'indiana')) as fp:
                self.client.post(reverse('source_code_upload'),
                                 {'source_code_file': fp,
                                  'buids': [buid],
                                  'source_code_parameter': 'src'})

            actual_view_sources = set(
                DestinationManipulation.objects.values_list('view_source',
                                                            flat=True))

            self.assertEqual(actual_view_sources, set(view_sources))

            DestinationManipulation.objects.all().delete()
