from django.core.management.base import BaseCommand
from myreports.tests.setup import create_full_fixture


class Command(BaseCommand):
    help = """
           Clear dynamic report data and create a data fixture suitable for
           testing dynamic reports.

           WARNING: existing data is deleted from the tables to preserve stable
           ids and test behavior.
           """

    def handle(self, *args, **options):
        create_full_fixture()
