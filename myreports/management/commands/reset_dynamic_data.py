from django.core.management.base import BaseCommand
from myreports.tests.factories import create_full_fixture


class Command(BaseCommand):
    help = """
           Clear dynamic report data and create a data fixture suitable for
           testing dynamic reports.
           """

    def handle(self, *args, **options):
        create_full_fixture()
