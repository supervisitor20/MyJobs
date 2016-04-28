from myjobs.tests.setup import MyJobsBase
from mypartners.tests.factories import PartnerFactory

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


class MyReportsTestCase(MyJobsBase):
    """
    Base class for all MyReports Tests. Identical to `django.test.TestCase`
    except that it provides a MyJobs TestClient instance and a logged in user.
    """
    def setUp(self):
        super(MyReportsTestCase, self).setUp()
        self.role.activities = self.activities
        self.partner = PartnerFactory(name='Test Partner', owner=self.company)
        self.dynamic_models = create_full_fixture()


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

    returns:
        a dictionary of references to models important for testing
        Keys named "dead" or "maybe_dead" refer to models that exist to
        catch failures to filter out various kinds of inactive-ness.
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

    # Naming convention:
    # ut_... User Type
    # rit_... ReportING Type
    # rt_... Report Type
    # dt_... Data Type
    # pre... Presentation Type
    # con... Configuration
    # rtdt... Report Type/Data Type
    # rtpt... Report Type/Presentation Type
    # ...con Contact
    # ...comm Communication Record
    # ...dead Record is marked inactive
    # ...maybe_dead Record will be related to another inactive record.
    # ...unagg Unagregated

    UserType.objects.all().delete()
    ut_emp_dead = UserTypeFactory.create(
        user_type="EMPLOYER", is_active=False)
    ut_emp = UserTypeFactory.create(user_type="EMPLOYER")
    ut_staff = UserTypeFactory.create(user_type="STAFF")

    ReportingType.objects.all().delete()
    rit_prm = ReportingTypeFactory.create(
        reporting_type="prm",
        description="PRM Reports")
    rit_comp = ReportingTypeFactory.create(
        reporting_type="compliance",
        description="Compliance Reports")
    rit_dead = ReportingTypeFactory.create(
        reporting_type="Dead",
        description="Dead Reports",
        is_active=False)
    rit_maybe_dead = ReportingTypeFactory.create(
        reporting_type="Maybe Dead",
        description="Maybe Dead Reports",
        is_active=False)
    rit_wrong = ReportingTypeFactory.create(
        reporting_type="Wrong UT",
        description="Wrong UserType")

    UserReportingTypes.objects.all().delete()
    UserReportingTypesFactory.create(
        user_type=ut_emp, reporting_type=rit_prm)
    UserReportingTypesFactory.create(
        user_type=ut_emp, reporting_type=rit_comp)
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
        report_type="partners",
        description="Partners Report",
        datasource="partners")
    rt_con = ReportTypeFactory(
        report_type="contacts",
        description="Contacts Report",
        datasource="contacts")
    rt_comm = ReportTypeFactory(
        report_type="communication-records",
        description="Communication Records Report",
        datasource="comm_records")
    rt_state = ReportTypeFactory(
        report_type="state",
        description="State Report")
    rt_screen = ReportTypeFactory(
        report_type="screenshots",
        description="Screenshots Report")
    rt_dead = ReportTypeFactory(
        report_type="Dead",
        description="Dead Report",
        is_active=False)
    rt_maybe_dead = ReportTypeFactory(
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
        data_type="",
        description="Dead",
        is_active=False)
    dt_maybe_dead = DataTypeFactory.create(
        data_type="",
        description="Maybe Dead")
    dt_unagg = DataTypeFactory.create(
        data_type="unaggregated",
        description="Unaggregated")
    dt_count_comm_per_month_per_partner = DataTypeFactory.create(
        data_type="count_comm_rec_per_month",
        description="Number of Communication Records per Month per Partner")

    PresentationType.objects.all().delete()
    pre_dead = PresentationTypeFactory.create(
        description="Inactive", is_active=False)
    pre_maybe_dead = PresentationTypeFactory.create(
        description="Maybe Inactive")
    pre_csv = PresentationTypeFactory.create(
        presentation_type="csv", description="Unformatted CSV")
    pre_xlsx = PresentationTypeFactory.create(
        presentation_type="xlsx", description="Excel xlsx")
    pre_json = PresentationTypeFactory.create(
        is_active=False,
        presentation_type="json_pass",
        description="JSON Passthrough")

    Configuration.objects.all().delete()
    con_dead = ConfigurationFactory.create(
        name="Inactive", is_active=False)
    ConfigurationFactory.create(
        name="Maybe Inactive")
    con_con = ConfigurationFactory.create(
        name="Contact Basic Report")
    con_part = ConfigurationFactory.create(
        name="Partner Basic Report")
    con_comm = ConfigurationFactory.create(
        name="Communication Records Basic Report")
    con_comm_count = ConfigurationFactory.create(
        name="Partners Comm Record Count Per Month Report")

    ConfigurationColumn.objects.all().delete()
    ConfigurationColumnFactory.create(
        column_name="dead",
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False,
        is_active=False)
    ConfigurationColumnFactory.create(
        column_name="name",
        order=100,
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="partner",
        order=101,
        output_format="text",
        filter_interface_type='search_multiselect',
        filter_interface_display='Partners',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="email",
        order=102,
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="phone",
        order=103,
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="date",
        order=104,
        configuration=con_con,
        output_format="us_date",
        filter_interface_type='date_range',
        filter_interface_display='Date',
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="notes",
        order=105,
        output_format="text",
        configuration=con_con,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="locations",
        order=106,
        output_format="city_state_list",
        filter_interface_type='city_state',
        filter_interface_display='Location',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="tags",
        order=107,
        output_format="tags_list",
        filter_interface_type='tags',
        filter_interface_display='Tags',
        configuration=con_con,
        multi_value_expansion=False,
        has_help=True)

    ConfigurationColumnFactory.create(
        column_name="data_source",
        order=103,
        output_format="text",
        filter_interface_type='search_select',
        filter_interface_display='Data Source',
        configuration=con_part,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="name",
        order=104,
        output_format="text",
        configuration=con_part,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        order=105,
        column_name="locations",
        filter_interface_type='city_state',
        filter_interface_display='Contact Location',
        filter_only=True,
        configuration=con_part,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="date",
        order=106,
        configuration=con_part,
        output_format="us_date",
        filter_interface_type='date_range',
        filter_interface_display='Date',
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="primary_contact",
        order=107,
        output_format="text",
        configuration=con_part,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="tags",
        order=108,
        output_format="tags_list",
        filter_interface_type='tags',
        filter_interface_display='Tags',
        configuration=con_part,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="uri",
        order=109,
        output_format="text",
        filter_interface_type='search_select',
        filter_interface_display='URL',
        configuration=con_part,
        multi_value_expansion=False)

    ConfigurationColumnFactory.create(
        column_name="contact",
        order=123,
        output_format="text",
        filter_interface_type='search_multiselect',
        filter_interface_display='Contacts',
        configuration=con_comm,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="contact_email",
        order=104,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="contact_phone",
        order=105,
        configuration=con_comm,
        output_format="text",
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="communication_type",
        order=109,
        filter_interface_type='search_multiselect',
        filter_interface_display='Communication Type',
        configuration=con_comm,
        output_format="text",
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="created_on",
        order=107,
        configuration=con_comm,
        output_format="us_date",
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="created_by",
        order=108,
        configuration=con_comm,
        output_format="text",
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="date_time",
        order=106,
        configuration=con_comm,
        output_format="us_date",
        filter_interface_type='date_range',
        filter_interface_display='Date',
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="job_applications",
        order=111,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="job_hires",
        order=112,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="job_id",
        order=113,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="job_interviews",
        order=114,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="last_action_time",
        order=115,
        output_format="us_date",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="length",
        order=116,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="location",
        order=117,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="notes",
        order=118,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="partner",
        order=122,
        output_format="text",
        filter_interface_type='search_multiselect',
        filter_interface_display='Partners',
        configuration=con_comm,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="subject",
        order=120,
        output_format="text",
        configuration=con_comm,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="tags",
        order=121,
        output_format="tags_list",
        filter_interface_type='tags',
        filter_interface_display='Tags',
        configuration=con_comm,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        order=102,
        column_name="locations",
        filter_interface_type='city_state',
        filter_interface_display='Contact Location',
        filter_only=True,
        configuration=con_comm,
        multi_value_expansion=False,
        has_help=True)

    ConfigurationColumnFactory.create(
        column_name="data_source",
        order=103,
        output_format="text",
        filter_interface_type='search_select',
        filter_interface_display='Data Source',
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="name",
        order=104,
        output_format="text",
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="date",
        order=105,
        configuration=con_comm_count,
        output_format="us_date",
        filter_interface_type='date_range',
        filter_interface_display='Date',
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="primary_contact",
        order=106,
        output_format="text",
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="tags",
        order=107,
        output_format="tags_list",
        filter_interface_type='tags',
        filter_interface_display='Tags',
        configuration=con_comm_count,
        multi_value_expansion=False,
        has_help=True)
    ConfigurationColumnFactory.create(
        column_name="uri",
        order=108,
        output_format="text",
        filter_interface_type='search_select',
        filter_interface_display='URL',
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="year",
        order=109,
        output_format="text",
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="month",
        order=110,
        output_format="text",
        configuration=con_comm_count,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        column_name="comm_rec_count",
        order=111,
        output_format="text",
        configuration=con_comm_count,
        multi_value_expansion=False)

    ReportTypeDataTypes.objects.all().delete()
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_dead,  configuration=con_con)
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_maybe_dead, is_active=False,
        configuration=con_con)
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_maybe_dead, is_active=False,
        configuration=con_dead)
    rtdt_con_unagg = ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_unagg, configuration=con_con)
    rtdt_part_unagg = ReportTypeDataTypesFactory.create(
        report_type=rt_partners, data_type=dt_unagg,
        configuration=con_part)
    rtdt_comm_unagg = ReportTypeDataTypesFactory.create(
        report_type=rt_comm, data_type=dt_unagg, configuration=con_comm)
    rtdt_comm_count_pmpp = ReportTypeDataTypesFactory.create(
        report_type=rt_partners, configuration=con_comm_count,
        data_type=dt_count_comm_per_month_per_partner)
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_unagg, is_active=False,
        configuration=con_dead)

    ReportPresentation.objects.all().delete()
    ReportPresentationFactory.create(
        presentation_type=pre_maybe_dead,
        display_name="Dead", report_data=rtdt_con_unagg, is_active=False)
    ReportPresentationFactory.create(
        presentation_type=pre_dead,
        display_name="Dead Presentation",
        report_data=rtdt_con_unagg, is_active=True)
    rtpt_con = ReportPresentationFactory.create(
        presentation_type=pre_csv,
        display_name="Contact CSV",
        report_data=rtdt_con_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_csv,
        display_name="Partner CSV",
        report_data=rtdt_part_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_csv,
        display_name="Communication Record CSV",
        report_data=rtdt_comm_unagg, is_active=True)
    rtpt_xlsx = ReportPresentationFactory.create(
        presentation_type=pre_xlsx,
        display_name="Contact Excel Spreadsheet",
        report_data=rtdt_con_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_xlsx,
        display_name="Partner Excel Spreadsheet",
        report_data=rtdt_part_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_xlsx,
        display_name="Communication Record Excel Spreadsheet",
        report_data=rtdt_comm_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_json,
        display_name="Partner JSON Passthrough",
        report_data=rtdt_part_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_json,
        display_name="Contact JSON Passthrough",
        report_data=rtdt_con_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_json,
        display_name="Communication Record JSON Passthrough",
        report_data=rtdt_comm_unagg, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_csv,
        display_name="Communication Record Count CSV",
        report_data=rtdt_comm_count_pmpp, is_active=True)
    ReportPresentationFactory.create(
        presentation_type=pre_json,
        display_name="Communication Record Count JSON Passthrough",
        report_data=rtdt_comm_count_pmpp, is_active=True)

    return {
        'user_type': {
            'dead': ut_emp_dead,
            'employee': ut_emp,
            'staff': ut_staff,
        },
        'reporting_type': {
            'prm': rit_prm,
            'compliance': rit_comp,
            'dead': rit_dead,
            'maybe_dead': rit_maybe_dead,
            'wrong': rit_wrong,
        },
        'report_type': {
            'partners': rt_partners,
            'contacts': rt_con,
            'communication_records': rt_comm,
            'state': rt_state,
            'screenshots': rt_screen,
            'dead': rt_dead,
            'maybe_dead': rt_maybe_dead,
        },
        'data_type': {
            'dead': dt_dead,
            'maybe_dead': dt_maybe_dead,
            'unaggregated': dt_unagg,
            'count_comm_per_month_per_partner':
                dt_count_comm_per_month_per_partner,
        },
        'presentation_type': {
            'dead': pre_dead,
            'maybe_dead': pre_maybe_dead,
            'csv': pre_csv,
            'xlsx': pre_xlsx,
            'json': pre_json,
        },
        'configuration': {
            'dead': con_dead,
            'contacts': con_con,
            'partners': con_part,
            'communication_records': con_comm,
            'communication_records_count': con_comm_count,
        },
        'report_type/data_type': {
            'contacts/unaggregated': rtdt_con_unagg,
            'partners/unaggregated': rtdt_part_unagg,
            'communication_records/unaggregated': rtdt_comm_unagg,
            'communication_records_count/unaggregated':
                rtdt_comm_count_pmpp,
        },
        'report_type/presentation_type': {
            'contacts/csv': rtpt_con,
            'contacts/xlsx': rtpt_xlsx,
        },
    }
