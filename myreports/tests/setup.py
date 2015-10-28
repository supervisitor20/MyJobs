from django.test import TestCase

from myjobs.tests.test_views import TestClient
from myjobs.tests.factories import UserFactory
from mypartners.tests.factories import PartnerFactory
from seo.tests.factories import CompanyFactory, CompanyUserFactory

from myreports.tests.factories import (
    UserTypeFactory, ReportingTypeFactory, UserReportingTypesFactory,
    ReportTypeFactory, ReportingTypeReportTypesFactory, DataTypeFactory,
    ReportTypeDataTypesFactory, PresentationTypeFactory,
    ReportPresentationFactory, ConfigurationFactory, ColumnFactory,
    ConfigurationColumnFactory, InterfaceElementTypeFactory,
    ColumnFormatFactory, ConfigurationColumnFormatsFactory)

from myreports.models import (
    UserType, ReportingType, UserReportingTypes, ReportType,
    ReportingTypeReportTypes, DataType, ReportTypeDataTypes,
    PresentationType, ReportPresentation, Configuration, Column,
    ConfigurationColumn, InterfaceElementType, ColumnFormat,
    ConfigurationColumnFormats)


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
        description="Contacts Report")
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

    InterfaceElementType.objects.all().delete()
    int_dead = InterfaceElementTypeFactory.create(
        id=1,
        interface_element_type="inactive",
        description="Inactive Element Type",
        element_code="div",
        is_active=False)
    int_maybe_dead = InterfaceElementTypeFactory.create(
        id=2,
        interface_element_type="maybe inactive",
        description="Maybe Inactive Element Type",
        element_code="div",
        is_active=True)
    int_text = InterfaceElementTypeFactory.create(
        id=3,
        interface_element_type="Text",
        description="Text Data",
        element_code="div",
        is_active=True)
# might need this in the future
#    int_timestamp = InterfaceElementTypeFactory.create(
#        id=4,
#        interface_element_type="Timestamp",
#        description="Date and Time of an Event",
#        element_code="div",
#        is_active=True)
    int_email = InterfaceElementTypeFactory.create(
        id=5,
        interface_element_type="Email Address",
        description="Email Address",
        element_code="div",
        is_active=True)
    int_multi_text = InterfaceElementTypeFactory.create(
        id=6,
        interface_element_type="Multi Text",
        description="Multiple Text Fields Joined by Commas",
        element_code="div",
        is_active=True)

    Column.objects.all().delete()
    col_1 = ColumnFactory.create(
        id=1,
        column_name=u'inactive-zzz',
        is_active=False)
    col_2 = ColumnFactory.create(
        id=2,
        column_name=u'maybe-inactive-zzz')
    col_4 = ColumnFactory.create(
        id=4,
        column_name=u'name')
    col_5 = ColumnFactory.create(
        id=5,
        column_name=u'email')
    col_6 = ColumnFactory.create(
        id=6,
        column_name=u'locations')
    col_7 = ColumnFactory.create(
        id=7,
        column_name=u'tags')
    col_8 = ColumnFactory.create(
        id=8,
        column_name=u'partner')

    ConfigurationColumn.objects.all().delete()
    ccol_dead = ConfigurationColumnFactory.create(
        id=1,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_1,
        multi_value_expansion=False)
    ccol_maybe_dead = ConfigurationColumnFactory.create(
        id=2,
        configuration=con_con,
        interface_element_type=int_maybe_dead,
        column=col_2,
        multi_value_expansion=False,
        is_active=False)
    ccol_name = ConfigurationColumnFactory.create(
        id=4,
        configuration=con_con,
        interface_element_type=int_text,
        column=col_4,
        multi_value_expansion=False)
    ccol_email = ConfigurationColumnFactory.create(
        id=5,
        configuration=con_con,
        interface_element_type=int_email,
        column=col_5,
        multi_value_expansion=False)
    ccol_locations = ConfigurationColumnFactory.create(
        id=6,
        configuration=con_con,
        interface_element_type=int_multi_text,
        column=col_6,
        multi_value_expansion=False)
    ccol_tags = ConfigurationColumnFactory.create(
        id=7,
        configuration=con_con,
        interface_element_type=int_multi_text,
        column=col_7,
        multi_value_expansion=False)
    ccol_partners = ConfigurationColumnFactory.create(
        id=8,
        configuration=con_con,
        interface_element_type=int_text,
        column=col_8,
        multi_value_expansion=False)

    ColumnFormat.objects.all().delete()
    colf_dead = ColumnFormatFactory.create(
        id=1,
        name='inactive',
        format_code='text',
        is_active=False)
    colf_maybe_dead = ColumnFormatFactory.create(
        id=2,
        name='maybe inactive',
        format_code='text')
    colf_text = ColumnFormatFactory.create(
        id=3,
        name='Text',
        format_code='text')
    colf_multi_text = ColumnFormatFactory.create(
        id=4,
        name='Multi Text',
        format_code='multitext')

    ConfigurationColumnFormats.objects.all().delete()
    ConfigurationColumnFormatsFactory.create(
        id=1,
        configuration_column=ccol_dead,
        column_format=colf_dead,
        is_active=False)
    ConfigurationColumnFormatsFactory.create(
        id=2,
        configuration_column=ccol_maybe_dead,
        column_format=colf_maybe_dead,
        is_active=False)
    ConfigurationColumnFormatsFactory.create(
        id=3,
        configuration_column=ccol_name,
        column_format=colf_text)
    ConfigurationColumnFormatsFactory.create(
        id=4,
        configuration_column=ccol_email,
        column_format=colf_text)
    ConfigurationColumnFormatsFactory.create(
        id=5,
        configuration_column=ccol_locations,
        column_format=colf_multi_text)
    ConfigurationColumnFormatsFactory.create(
        id=6,
        configuration_column=ccol_tags,
        column_format=colf_multi_text)
    ConfigurationColumnFormatsFactory.create(
        id=7,
        configuration_column=ccol_partners,
        column_format=colf_text)

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
