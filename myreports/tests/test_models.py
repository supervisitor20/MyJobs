from myreports.tests.setup import MyReportsTestCase

from myreports.models import UserType, ReportingType, ReportType


class TestModels(MyReportsTestCase):
    fixtures = ['class_and_pres.json']

    def test_user_type(self):
        user_type = UserType.objects.for_user(self.user)
        self.assertEqual('MEMBER', user_type.user_type)

    def test_active_reporting_type(self):
        reporting_type = (ReportingType.objects
                          .active_for_user(self.user).first())
        self.assertEqual('PRM', reporting_type.reporting_type)

    def test_active_report_type_by_reporting_type(self):
        reporting_type = ReportingType.objects.get(id=1)
        report_types = (ReportType.objects
                        .active_for_reporting_type(reporting_type))
        names = set(t.report_type for t in report_types)
        self.assertEqual(set(['Partners', 'Communication Records']), names)
