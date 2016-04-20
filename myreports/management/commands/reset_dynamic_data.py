from django.core.management.base import BaseCommand
from myreports.tests.setup import create_full_fixture
from myreports.models import ReportingType


class Command(BaseCommand):
    help = """
           Clear dynamic report data and create a data fixture suitable for
           testing dynamic reports.

           WARNING: existing data is deleted from the tables to preserve stable
           ids and test behavior.
           """

    def handle(self, *args, **options):
        create_full_fixture()
        # mark compliance inactive
        # Everyone is tired of looking at it.
        compliance = ReportingType.objects.get(reporting_type="compliance")
        compliance.is_active = False
        compliance.save()
