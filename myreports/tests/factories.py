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


class ConfigurationColumnFactory(DjangoModelFactory):
    class Meta:
        model = 'myreports.ConfigurationColumn'

    is_active = True
