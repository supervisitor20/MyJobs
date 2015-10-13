from factory.django import DjangoModelFactory


class UserTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.UserType'

    is_active = True


class ReportingTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ReportingType'

    is_active = True


class UserReportingTypesFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.UserReportingTypes'

    is_active = True


class ReportTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ReportType'

    is_active = True


class ReportingTypeReportTypesFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ReportingTypeReportTypes'

    is_active = True


class DataTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.DataType'

    is_active = True


class ReportTypeDataTypesFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ReportTypeDataTypes'

    is_active = True


class PresentationTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.PresentationType'

    is_active = True


class ReportPresentationFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ReportPresentation'

    is_active = True


class ConfigurationFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.Configuration'

    is_active = True


class ColumnFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.Column'

    is_active = True


class ConfigurationColumnFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ConfigurationColumn'

    is_active = True


class InterfaceElementTypeFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.InterfaceElementType'

    is_active = True


def create_full_fixture():
    UserTypeFactory._meta.model.objects.all().delete()
    ut_emp_dead = UserTypeFactory.create(
        id=1, user_type="EMPLOYER", is_active=False)
    ut_emp = UserTypeFactory.create(id=2, user_type="EMPLOYER")
    ut_staff = UserTypeFactory.create(id=3, user_type="STAFF")

    ReportingTypeFactory._meta.model.objects.all().delete()
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

    UserReportingTypesFactory._meta.model.objects.all().delete()
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

    ReportTypeFactory._meta.model.objects.all().delete()
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

    ReportingTypeReportTypesFactory._meta.model.objects.all().delete()
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

    DataTypeFactory._meta.model.objects.all().delete()
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

    ReportTypeDataTypesFactory._meta.model.objects.all().delete()
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_dead)
    ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_maybe_dead, is_active=False)
    rtdt_conn_unagg = ReportTypeDataTypesFactory.create(
        report_type=rt_con, data_type=dt_unagg)

    PresentationTypeFactory._meta.model.objects.all().delete()
    pre_dead = PresentationTypeFactory.create(
        id=1, presentation_type="Inactive", is_active=False)
    pre_maybe_dead = PresentationTypeFactory.create(
        id=2, presentation_type="Maybe Inactive")
    pre_csv = PresentationTypeFactory.create(
        id=3, presentation_type="Unformatted CSV")

    ConfigurationFactory._meta.model.objects.all().delete()
    con_dead = ConfigurationFactory.create(
        id=1, name="Inactive", is_active=False)
    ConfigurationFactory.create(
        id=2, name="Maybe Inactive")
    con_con = ConfigurationFactory.create(
        id=3, name="Basic Report")

    InterfaceElementTypeFactory._meta.model.objects.all().delete()
    int_dead = InterfaceElementTypeFactory.create(
        id=1,
        interface_element_type="inactive",
        description="Inactive Element Type",
        element_code="div",
        is_active=False)

    ColumnFactory._meta.model.objects.all().delete()
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

    ConfigurationColumnFactory._meta.model.objects.all().delete()
    ConfigurationColumnFactory.create(
        id=1,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_1,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=2,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_2,
        multi_value_expansion=False,
        is_active=False)
    ConfigurationColumnFactory.create(
        id=4,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_4,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=5,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_5,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=6,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_6,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=7,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_7,
        multi_value_expansion=False)
    ConfigurationColumnFactory.create(
        id=8,
        configuration=con_con,
        interface_element_type=int_dead,
        column=col_8,
        multi_value_expansion=False)

    ReportPresentationFactory._meta.model.objects.all().delete()
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
