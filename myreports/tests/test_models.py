import json

from django.core.exceptions import SuspiciousOperation
from myreports.tests.setup import MyReportsTestCase
from myreports.tests.factories import ConfigurationColumnFactory

from myreports.models import (
    UserType, ReportingType, ReportType, DynamicReport,
    ConfigurationColumn, ReportPresentation, DataType, ReportTypeDataTypes,
    Configuration)
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
        reporting_type = ReportingType.objects.get(id=1)
        report_types = (ReportType.objects
                        .active_for_reporting_type(reporting_type))
        names = set(t.report_type for t in report_types)
        expected_names = set([
            'partners', 'communication-records', 'contacts'])
        self.assertEqual(expected_names, names)

    def test_active_data_types(self):
        """Avoid different kinds of inactive data types."""
        report_type = ReportType.objects.get(id=2)
        data_types = (DataType.objects
                      .active_for_report_type(report_type))
        names = set(d.data_type for d in data_types)
        expected_names = set(['unaggregated'])
        self.assertEqual(expected_names, names)

    def test_first_active_report_data(self):
        """Avoid different kinds of inactive report/data types."""

        report_type = ReportType.objects.get(id=2)
        data_type = DataType.objects.get(id=3)
        report_data = (
            ReportTypeDataTypes.objects
            .first_active_for_report_type_data_type(report_type, data_type))
        self.assertEqual('contacts', report_data.report_type.report_type)
        self.assertEqual('unaggregated', report_data.data_type.data_type)

    def test_first_active_report_data_mismatch(self):
        """Avoid different kinds of inactive report/data types."""

        report_type = ReportType.objects.get(id=6)
        data_type = DataType.objects.get(id=4)
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
        report_data = ReportTypeDataTypes.objects.get(id=4)
        rps = (ReportPresentation.objects
               .active_for_report_type_data_type(report_data))
        names = set([rp.display_name for rp in rps])
        expected_names = set(['Contact CSV', 'Contact Excel Spreadsheet'])
        self.assertEqual(expected_names, names)

    def test_active_columns(self):
        """Avoid different kinds of inactive column types."""
        report_data = ReportTypeDataTypes.objects.get(id=4)
        columns = (
            ConfigurationColumn.objects
            .active_for_report_data(report_data))
        expected_columns = set([
            u'phone', u'date', u'locations', u'partner', u'tags',
            u'name', u'email', u'notes'])
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


class TestReportConfiguration(MyReportsTestCase):
    def test_build_config(self):
        """Test building a report configuration from the DB."""
        expected_config = ReportConfiguration(
            columns=[
                ColumnConfiguration(
                    column='name',
                    format='text'),
                ColumnConfiguration(
                    column='partner',
                    format='text',
                    filter_interface='search_multiselect',
                    filter_display='Partners',
                    help=True),
                ColumnConfiguration(
                    column='email',
                    format='text'),
                ColumnConfiguration(
                    column='phone',
                    format='text'),
                ColumnConfiguration(
                    column='date',
                    format='us_date',
                    filter_interface='date_range',
                    filter_display='Date'),
                ColumnConfiguration(
                    column='notes',
                    format='text'),
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
            ])
        config_model = Configuration.objects.get(id=3)
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

        report_data = ReportTypeDataTypes.objects.get(id=4)
        report = DynamicReport.objects.create(
            report_data=report_data,
            owner=self.company)
        report.regenerate()
        expected_column_names = set([
            'name', 'tags', 'notes', 'locations', 'phone', 'partner',
            'email', 'date'])
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

        report_data = ReportTypeDataTypes.objects.get(id=4)
        report = DynamicReport.objects.create(
            report_data=report_data,
            filters=json.dumps({
                'locations': {
                    'city': 'city-2',
                },
            }),
            owner=self.company)
        report.regenerate()
        expected_column_names = set([
            'name', 'tags', 'notes', 'locations', 'phone', 'partner',
            'email', 'date'])
        self.assertEqual(1, len(report.python))
        self.assertEqual('name-2', report.python[0]['name'])
        self.assertEqual(expected_column_names, set(report.python[0]))
