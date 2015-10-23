from myreports.tests.setup import MyReportsTestCase

from myreports.models import (
    UserType, ReportingType, ReportType, Configuration, DynamicReport,
    Column, ReportPresentation, DataType, ReportTypeDataTypes)
from myjobs.tests.factories import UserFactory
from mypartners.tests.factories import ContactFactory, PartnerFactory
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
        config = Configuration.objects.get(id=3)
        columns = Column.objects.active_for_configuration(config)
        expected_columns = set([
            u'locations', u'partner', u'tags', u'name', u'email'])
        actual_columns = set(c.column_name for c in columns)
        self.assertEqual(expected_columns, actual_columns)


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
            'email'])
        self.assertEqual(10, len(report.python))
        self.assertEqual(expected_column_names, set(report.python[0]))
