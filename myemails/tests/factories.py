from factory import django, SubFactory

from django.contrib.auth.models import ContentType

from myemails.models import Event
from seo.tests.factories import CompanyFactory


class EmailSectionHeaderFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.EmailSection'

    section_type = 1
    content = 'This is a header.'


class EmailSectionFooterFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.EmailSection'

    section_type = 3
    content = 'This is a footer.'


class EmailTemplateFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.EmailTemplate'

    header = SubFactory(EmailSectionHeaderFactory)
    body = 'This is a body.'
    footer = SubFactory(EmailSectionFooterFactory)


class ValueEventFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.ValueEvent'

    is_active = True
    owner = SubFactory(CompanyFactory)

    model = ContentType.objects.get_for_model(Event)
    field = 'pk'

    compare_using = '__gte'
    value = 1


class CronEventFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.CronEvent'

    is_active = True
    owner = SubFactory(CompanyFactory)

    model = ContentType.objects.get_for_model(Event)
    field = ''

    minutes = 10


class CreatedEventFactory(django.DjangoModelFactory):
    class Meta:
        model = 'myemails.CreatedEvent'

    is_active = True
    owner = SubFactory(CompanyFactory)

    model = ContentType.objects.get_for_model(Event)
