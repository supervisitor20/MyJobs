import json

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import SuspiciousOperation
from myreports.tests.setup import MyReportsTestCase
from myreports.tests.factories import ConfigurationColumnFactory

from myjobs.models import User
from myreports.models import (
    UserType, ReportingType, ReportType, DynamicReport,
    ConfigurationColumn, ReportPresentation, DataType, ReportTypeDataTypes)
from myreports.report_configuration import (
    ReportConfiguration, ColumnConfiguration)
from myjobs.tests.factories import UserFactory
from mypartners.tests.factories import (
    ContactFactory, PartnerFactory, LocationFactory)


class TestActiveModels(MyReportsTestCase):
    """Test finding active models. vs. models marked inactive.

    These tests are dependent on the reset fixture in the factory.
    """
    def test_jobseeker_user_type(self):
        """Jobseeker user type"""
        user = UserFactory.create(email='alice1@example.com')
        self.assert_user_type(None, user)

    def test_employer_user_type(self):
        """Company user type"""
        self.assert_user_type('EMPLOYER', self.user)

    def test_staff_user_type(self):
        """Staff user type"""
        user = UserFactory.create(email='alice1@example.com')
        user.is_staff = True
        self.assert_user_type('STAFF', user)

    def assert_user_type(self, expected, user):
        """Both user type properties present"""
        self.client.login_user(self.user)
        user_type = UserType.objects.for_user(user)
        if expected is None:
            self.assertTrue(user_type is None)
        else:
            self.assertEqual(expected, user_type.user_type)

    def test_active_reporting_type(self):
        """Avoid different kinds of inactive reporting types."""
        reporting_type = (ReportingType.objects
                          .active_for_user(self.user).first())
        self.assertEqual('prm', reporting_type.reporting_type)

    def test_active_report_type_by_reporting_type(self):
        """Avoid different kinds of inactive report types."""
        reporting_type = self.dynamic_models['reporting_type']['prm']
        report_types = (ReportType.objects
                        .active_for_reporting_type(reporting_type))
        names = set(t.report_type for t in report_types)
        expected_names = {
            'partners', 'communication-records', 'contacts'}
        self.assertEqual(expected_names, names)

    def test_active_data_types(self):
        """Avoid different kinds of inactive data types."""
        report_type = self.dynamic_models['report_type']['contacts']
        data_types = (DataType.objects
                      .active_for_report_type(report_type))
        names = set(d.data_type for d in data_types)
        expected_names = {'unaggregated'}
        self.assertEqual(expected_names, names)

    def test_first_active_report_data(self):
        """Avoid different kinds of inactive report/data types."""

        report_type = self.dynamic_models['report_type']['contacts']
        data_type = self.dynamic_models['data_type']['unaggregated']
        report_data = (
            ReportTypeDataTypes.objects
            .first_active_for_report_type_data_type(report_type, data_type))
        self.assertEqual('contacts', report_data.report_type.report_type)
        self.assertEqual('unaggregated', report_data.data_type.data_type)

    def test_first_active_report_data_mismatch(self):
        """Avoid different kinds of inactive report/data types."""

        report_type = self.dynamic_models['report_type']['dead']
        data_type = self.dynamic_models['data_type']['unaggregated']
        report_data = (
            ReportTypeDataTypes.objects
            .first_active_for_report_type_data_type(report_type, data_type))
        self.assertIsNone(report_data)

    def test_first_active_report_data_none(self):
        """Avoid different kinds of inactive report/data types."""

        report_data = (
            ReportTypeDataTypes.objects
            .first_active_for_report_type_data_type(None, None))
        self.assertIsNone(report_data)

    def test_active_report_presentations(self):
        """Avoid different kinds of inactive presentation types."""
        report_data = (
            self.dynamic_models['report_type/data_type']
            ['contacts/unaggregated'])
        rps = (ReportPresentation.objects
               .active_for_report_type_data_type(report_data))
        names = {rp.display_name for rp in rps}
        expected_names = {'Contact CSV', 'Contact Excel Spreadsheet'}
        self.assertEqual(expected_names, names)

    def test_active_columns(self):
        """Avoid different kinds of inactive column types."""
        report_data = (
            self.dynamic_models['report_type/data_type']
            ['contacts/unaggregated'])
        columns = (
            ConfigurationColumn.objects
            .active_for_report_data(report_data))
        expected_columns = {
            u'phone', u'date', u'locations', u'partner', u'tags',
            u'name', u'email', u'notes'}
        actual_columns = set(c.column_name for c in columns)
        self.assertEqual(expected_columns, actual_columns)

    def test_build_choices_blank(self):
        choices = ReportTypeDataTypes.objects.build_choices(
            self.user, None, None, None)
        self.assertEquals(2, len(choices['reporting_types']))
        self.assertEquals(
            'compliance',
            choices['reporting_types'][0].reporting_type)
        self.assertEquals(
            choices['reporting_types'][0],
            choices['selected_reporting_type'])
        self.assertEquals(2, len(choices['report_types']))
        self.assertEquals(
            'screenshots',
            choices['report_types'][0].report_type)
        self.assertEquals(
            choices['report_types'][0],
            choices['selected_report_type'])
        self.assertEquals([], list(choices['data_types']))
        self.assertEquals(None, choices['selected_data_type'])

    def test_build_choices_select_reporting_type(self):
        choices = ReportTypeDataTypes.objects.build_choices(
            self.user, 'prm', None, None)
        self.assertEquals(2, len(choices['reporting_types']))
        self.assertEquals(
            'compliance',
            choices['reporting_types'][0].reporting_type)
        self.assertEquals(
            choices['reporting_types'][1],
            choices['selected_reporting_type'])
        self.assertEquals(3, len(choices['report_types']))
        self.assertEquals(
            'communication-records',
            choices['report_types'][0].report_type)
        self.assertEquals(
            choices['report_types'][0],
            choices['selected_report_type'])
        self.assertEquals(1, len(choices['data_types']))
        self.assertEquals(
            choices['data_types'][0],
            choices['selected_data_type'])

    def test_build_choices_select_report_type(self):
        choices = ReportTypeDataTypes.objects.build_choices(
            self.user, 'prm', 'partners', None)
        self.assertEquals(2, len(choices['reporting_types']))
        self.assertEquals(
            'compliance',
            choices['reporting_types'][0].reporting_type)
        self.assertEquals(
            choices['reporting_types'][1],
            choices['selected_reporting_type'])
        self.assertEquals(3, len(choices['report_types']))
        self.assertEquals(
            'communication-records',
            choices['report_types'][0].report_type)
        self.assertEquals(
            choices['report_types'][2],
            choices['selected_report_type'])
        self.assertEquals(2, len(choices['data_types']))
        self.assertEquals(
            choices['data_types'][0],
            choices['selected_data_type'])

    def test_build_choices_select_data_type(self):
        choices = ReportTypeDataTypes.objects.build_choices(
            self.user, 'prm', 'partners', 'unaggregated')
        self.assertEquals(2, len(choices['reporting_types']))
        self.assertEquals(
            'compliance',
            choices['reporting_types'][0].reporting_type)
        self.assertEquals(
            choices['reporting_types'][1],
            choices['selected_reporting_type'])
        self.assertEquals(3, len(choices['report_types']))
        self.assertEquals(
            'communication-records',
            choices['report_types'][0].report_type)
        self.assertEquals(
            choices['report_types'][2],
            choices['selected_report_type'])
        self.assertEquals(2, len(choices['data_types']))
        self.assertEquals(
            choices['data_types'][1],
            choices['selected_data_type'])

    def test_build_choices_wrong_report_type(self):
        choices = ReportTypeDataTypes.objects.build_choices(
            self.user, 'prm', 'WRONG', 'unaggregated')
        self.assertEquals(2, len(choices['reporting_types']))
        self.assertEquals(
            'compliance',
            choices['reporting_types'][0].reporting_type)
        self.assertEquals(
            choices['reporting_types'][1],
            choices['selected_reporting_type'])
        self.assertEquals(3, len(choices['report_types']))
        self.assertEquals(
            'communication-records',
            choices['report_types'][0].report_type)
        self.assertEquals(
            choices['report_types'][0],
            choices['selected_report_type'])
        self.assertEquals(1, len(choices['data_types']))
        self.assertEquals(
            choices['data_types'][0],
            choices['selected_data_type'])

    def test_build_choices_no_user(self):
        try:
            ReportTypeDataTypes.objects.build_choices(None, None, None, None)
            self.fail("Should have thrown exception")
        except SuspiciousOperation:
            pass

    def test_build_choices_user_has_no_pk(self):
        # Should not have a primary key yet.
        user = User()
        try:
            ReportTypeDataTypes.objects.build_choices(user, None, None, None)
            self.fail("Should have thrown exception")
        except SuspiciousOperation:
            pass

    def test_build_choices_user_is_anonymous(self):
        # Should not have a primary key yet.
        user = AnonymousUser()
        try:
            ReportTypeDataTypes.objects.build_choices(user, None, None, None)
            self.fail("Should have thrown exception")
        except SuspiciousOperation:
            pass


class TestReportConfiguration(MyReportsTestCase):
    def test_build_config(self):
        """
        Test building a report configuration from the DB.

        Here, we expect that an appropriate format should be selected for each
        of the columns configured *except* when that column is marked as
        ``filter_only```. For those columns, we expect format to be ``''``.
        """
        expected_config = ReportConfiguration(
            columns=[
                ColumnConfiguration(
                    column='date',
                    format='us_date',
                    filter_interface='date_range',
                    filter_display='Date'),
                ColumnConfiguration(
                    column='',
                    format=None,
                    help=True,
                    filter_interface=u'city_state',
                    filter_display=u'Contact Location'),
                ColumnConfiguration(
                    column='locations',
                    format='city_state_list',
                    filter_interface='city_state',
                    filter_display='Location',
                    help=True),
                ColumnConfiguration(
                    column='tags',
                    format='tags_list',
                    filter_interface='tags',
                    filter_display='Tags',
                    help=True),
                ColumnConfiguration(
                    column='partner',
                    format='text',
                    filter_interface='search_multiselect',
                    filter_display='Partners',
                    help=True),
                ColumnConfiguration(
                    column='name',
                    format='text'),
                ColumnConfiguration(
                    column='email',
                    format='text'),
                ColumnConfiguration(
                    column='phone',
                    format='text'),
                ColumnConfiguration(
                    column='notes',
                    format='text'),
            ])
        config_model = self.dynamic_models['configuration']['contacts']
        # Add a filter_only column.
        ConfigurationColumnFactory.create(
            filter_interface_type='city_state',
            filter_interface_display='Contact Location',
            filter_only=True,
            configuration=config_model,
            multi_value_expansion=False,
            has_help=True)
        self.maxDiff = 10000
        self.assertEqual(
            expected_config.columns,
            config_model.build_configuration().columns)


class TestDynamicReport(MyReportsTestCase):
    def test_report(self):
        """Run a dynamic report through its paces."""
        partner = PartnerFactory(owner=self.company)
        for i in range(0, 10):
            ContactFactory.create(name="name-%s" % i, partner=partner)

        report_data = (
            self.dynamic_models['report_type/data_type']
            ['contacts/unaggregated'])
        report = DynamicReport.objects.create(
            report_data=report_data,
            owner=self.company)
        report.regenerate()
        expected_column_names = {
            'name', 'tags', 'notes', 'locations', 'phone', 'partner',
            'email', 'date'}
        self.assertEqual(10, len(report.python))
        self.assertEqual(expected_column_names, set(report.python[0]))

    def test_filtered_report(self):
        """Run a dynamic report with a filter."""
        partner = PartnerFactory(owner=self.company)
        for i in range(0, 10):
            location = LocationFactory.create(
                city="city-%s" % i)
            ContactFactory.create(
                name="name-%s" % i,
                partner=partner,
                locations=[location])

        report_data = (
            self.dynamic_models['report_type/data_type']
            ['contacts/unaggregated'])
        report = DynamicReport.objects.create(
            report_data=report_data,
            filters=json.dumps({
                'locations': {
                    'city': 'city-2',
                },
            }),
            owner=self.company)
        report.regenerate()
        expected_column_names = {
            'name', 'tags', 'notes', 'locations', 'phone', 'partner',
            'email', 'date'}
        self.assertEqual(1, len(report.python))
        self.assertEqual('name-2', report.python[0]['name'])
        self.assertEqual(expected_column_names, set(report.python[0]))
