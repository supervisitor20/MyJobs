from django.test import TestCase

from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import UserFactory
from mypartners.tests.factories import PartnerFactory
from seo.tests.factories import CompanyFactory, CompanyUserFactory

from myreports.tests.factories import (
    UserTypeFactory, ReportingTypeFactory, UserReportingTypesFactory,
    ReportTypeFactory, ReportingTypeReportTypesFactory, DataTypeFactory,
    ReportTypeDataTypesFactory, PresentationTypeFactory,
    ReportPresentationFactory, ConfigurationFactory,
    ConfigurationColumnFactory)

from myreports.models import (
    UserType, ReportingType, UserReportingTypes, ReportType,
    ReportingTypeReportTypes, DataType, ReportTypeDataTypes,
    PresentationType, ReportPresentation, Configuration,
    ConfigurationColumn)


class MyReportsTestCase(TestCase):
    """
    Base class for all MyReports Tests. Identical to `django.test.TestCase`
    except that it provides a MyJobs TestClient instance and a logged in user.
    """
    def setUp(self):
        self.client = TestClient()
        self.user = UserFactory(email='testuser@directemployers.org')
        self.user.set_password('aa')
        self.company = CompanyFactory(name='Test Company')
        self.partner = PartnerFactory(name='Test Partner', owner=self.company)

        # associate company to user
        CompanyUserFactory(user=self.user, company=self.company)

        self.client.login_user(self.user)

        create_full_fixture()


def create_full_fixture():
    """This fixture fills out all the dynamic reporting tables.

    Its purpose is to support unit and UI testing.

    WARNING: existing data is deleted from the tables to preserve stable ids
    and test behavior.

    It covers:
        * Standard known reports.
        * All known forms of inactive records for every table.
        * UI and "active_..." manager methods should never return or show
          an inactive record. So UI should never see "Dead" or "Maybe Dead"
          items.
    """

    # For each model create one or more plausible active records.
    # - If a reference to this record isn't needed, don't make a variable for
    #   it.
    # - Otherwise, the variable name is short but named like:
    #   modelabbreviation_purpose
    # Also create an inactive record.
    # - If a variable is needed, name the variable "..._dead".
    # Also, create an active version of the record meant to be linked via an
    # inactive through record.
    # - If a variable is needed, name the variable "..._maybe_dead".

    # Delete all
    UserType.objects.all().delete()
    ut_emp_dead = UserTypeFactory.create(
        id=1, user_type="EMPLOYER", is_active=False)
    ut_emp = UserTypeFactory.create(id=2, user_type="EMPLOYER")
    ut_staff = UserTypeFactory.create(id=3, user_type="STAFF")

    ReportingType.objects.all().delete()
    rit_prm = ReportingTypeFactory.create(
        id=1,
        reporting_type="PRM",
        description="PRM Reports")
    rit_comp = ReportingTypeFactory.create(
        id=2,
        reporting_type="Compliance",
        description="Compliance Reports")
    rit_dead = ReportingTypeFactory.create(
        id=3,
        reporting_type="Dead",
        description="Dead Reports",
        is_active=False)
    rit_maybe_dead = ReportingTypeFactory.create(
        id=4,
        reporting_type="Maybe Dead",
        description="Maybe Dead Reports",
        is_active=False)
    rit_wrong = ReportingTypeFactory.create(
        id=5,
        reporting_type="Wrong UT",
        description="Wrong UserType")

    UserReportingTypes.objects.all().delete()
    UserReportingTypesFactory.create(
        user_type=ut_emp, reporting_type=rit_prm)
    UserReportingTypesFactory.create(
        user_type=ut_emp, reporting_type=rit_dead)
    UserReportingTypesFactory.create(
        user_type=ut_emp, reporting_type=rit_maybe_dead, is_active=False)
    UserReportingTypesFactory.create(
        user_type=ut_emp_dead, reporting_type=rit_wrong)
    UserReportingTypesFactory.create(
        user_type=ut_staff, reporting_type=rit_comp)

    ReportType.objects.all().delete()
    rt_partners = ReportTypeFactory(
        id=1,
        report_type="Partners",
        description="Partners Report")
    rt_con = ReportTypeFactory(
        id=2,
        report_type="Contacts",
        description="Contacts Report",
        datasource="contacts")
    rt_comm = ReportTypeFactory(
        id=3,
        report_type="Communication Records",
        description="Communication Records Report")
    rt_state = ReportTypeFactory(
        id=4,
        report_type="State",
        description="State Report")
    rt_screen = ReportTypeFactory(
        id=5,
        report_type="Screenshots",
        description="Screenshots Report")
    rt_dead = ReportTypeFactory(
        id=6,
        report_type="Dead",
        description="Dead Report",
        is_active=False)
    rt_maybe_dead = ReportTypeFactory(
        id=7,
        report_type="Maybe Dead",
        description="Maybe Dead Report")

    ReportingTypeReportTypes.objects.all().delete()
    ReportingTypeReportTypesFactory.create(
        report_type=rt_partners, reporting_type=rit_prm)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_con, reporting_type=rit_prm)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_comm, reporting_type=rit_prm)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_dead, reporting_type=rit_prm)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_maybe_dead, reporting_type=rit_prm,
        is_active=False)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_state, reporting_type=rit_comp)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_screen, reporting_type=rit_comp)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_dead, reporting_type=rit_comp)
    ReportingTypeReportTypesFactory.create(
        report_type=rt_maybe_dead, reporting_type=rit_prm,
        is_active=False)

    DataType.objects.all().delete()
    dt_dead = DataTypeFactory.create(
        id=1,
        data_type="Dead",
        description="Dead Data Type",
        is_active=False)
    dt_maybe_dead = DataTypeFactory.create(
        id=2,
        data_type="Maybe Dead",
        description="Maybe Dead Data Type")
    dt_unagg = DataTypeFactory.create(
        id=3,
        data_type="Unaggregated",
        description="Unaggregated Data Type")

    ReportTypeDataTypes.objects.all().delete()
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_dead)
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_maybe_dead, is_active=False)
    rtdt_conn_unagg = ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_unagg)

    PresentationType.objects.all().delete()
    pre_dead = PresentationTypeFactory.create(
        id=1, presentation_type="Inactive", is_active=False)
    pre_maybe_dead = PresentationTypeFactory.create(
        id=2, presentation_type="Maybe Inactive")
    pre_csv = PresentationTypeFactory.create(
        id=3, presentation_type="Unformatted CSV")

    Configuration.objects.all().delete()
    con_dead = ConfigurationFactory.create(
        id=1, name="Inactive", is_active=False)
    ConfigurationFactory.create(
        id=2, name="Maybe Inactive")
    con_con = ConfigurationFactory.create(
        id=3, name="Basic Report")

    ConfigurationColumn.objects.all().delete()
    ConfigurationColumnFactory.create(
        id=1,
        column_name="dead",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False,
        is_active=False)
    ConfigurationColumnFactory.create(
        id=3,
        column_name="name",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=4,
        column_name="partner",
        output_format="text",
        filter_interface_type='search_multiselect',
        filter_interface_display='Partners',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        id=5,
        column_name="email",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=6,
        column_name="phone",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=7,
        column_name="date",
        configuration=con_con,
        output_format="us_date",
        filter_interface_type='date_range',
        filter_interface_display='Date',
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=8,
        column_name="notes",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=9,
        column_name="locations",
        output_format="city_state_list",
        filter_interface_type='city_state',
        filter_interface_display='Location',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        id=10,
        column_name="tags",
        output_format="comma_sep",
        filter_interface_type='search_multiselect',
        filter_interface_display='Tags',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)

    ReportPresentation.objects.all().delete()
    ReportPresentationFactory.create(
        id=1, presentation_type=pre_maybe_dead, configuration=con_con,
        display_name="Dead", report_data=rtdt_conn_unagg, is_active=False)
    ReportPresentationFactory.create(
        id=2, presentation_type=pre_dead, configuration=con_con,
        display_name="Dead Presentation",
        report_data=rtdt_conn_unagg, is_active=True)
    ReportPresentationFactory.create(
        id=3, presentation_type=pre_csv, configuration=con_con,
        display_name="Contact CSV",
        report_data=rtdt_conn_unagg, is_active=True)
    ReportPresentationFactory.create(
        id=4, presentation_type=pre_csv, configuration=con_dead,
        display_name="Dead Configuration",
        report_data=rtdt_conn_unagg, is_active=True)
