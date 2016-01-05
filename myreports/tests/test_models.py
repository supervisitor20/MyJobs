import json

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
from seo.tests.factories import CompanyUserFactory


class TestActiveModels(MyReportsTestCase):
    """Test finding active models. vs. models marked inactive.

    These tests are dependent on the reset fixture in the factory.
    """
    def test_jobseeker_user_type(self):
        """Jobseeker user type"""
        user = UserFactory.create()
        self.assert_user_type(None, user)

    def test_employer_user_type(self):
        """Company user type"""
        cuser = CompanyUserFactory.create()
        user = cuser.user
        self.assert_user_type('EMPLOYER', user)

    def test_staff_user_type(self):
        """Staff user type"""
        user = UserFactory.create()
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
        self.assertEqual('PRM', reporting_type.reporting_type)

    def test_active_report_type_by_reporting_type(self):
        """Avoid different kinds of inactive report types."""
        reporting_type = ReportingType.objects.get(id=1)
        report_types = (ReportType.objects
                        .active_for_reporting_type(reporting_type))
        names = set(t.report_type for t in report_types)
        expected_names = set([
            'Partners', 'Communication Records', 'Contacts'])
        self.assertEqual(expected_names, names)

    def test_active_data_types(self):
        """Avoid different kinds of inactive data types."""
        report_type = ReportType.objects.get(id=2)
        data_types = (DataType.objects
                      .active_for_report_type(report_type))
        names = set(d.data_type for d in data_types)
        expected_names = set(['Unaggregated'])
        self.assertEqual(expected_names, names)

    def test_active_report_presentations(self):
        """Avoid different kinds of inactive presentation types."""
        rtdt = ReportTypeDataTypes.objects.get(
                data_type__data_type='Unaggregated',
                report_type__report_type='Contacts')
        rps = (ReportPresentation.objects
               .active_for_report_type_data_type(rtdt))
        names = set([rp.display_name for rp in rps])
        expected_names = set(['Contact CSV'])
        self.assertEqual(expected_names, names)

    def test_active_columns(self):
        """Avoid different kinds of inactive column types."""
        rp = ReportPresentation.objects.get(id=3)
        columns = (ConfigurationColumn.objects
                   .active_for_report_presentation(rp))
        expected_columns = set([
            u'phone', u'date', u'locations', u'partner', u'tags',
            u'name', u'email', u'notes'])
        actual_columns = set(c.column_name for c in columns)
        self.assertEqual(expected_columns, actual_columns)


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
                    format='comma_sep',
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

        report_pres = ReportPresentation.objects.get(id=3)
        report = DynamicReport.objects.create(
            report_presentation=report_pres,
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

        report_pres = ReportPresentation.objects.get(id=3)
        report = DynamicReport.objects.create(
            report_presentation=report_pres,
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
