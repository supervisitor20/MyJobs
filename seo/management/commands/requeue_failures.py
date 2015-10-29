from django.core.management.base import NoArgsCommand
from tasks import requeue_failures


class Command(NoArgsCommand):
    args = 'None'
    help = 'REqueues tasks that failed in the last eight hours.'

    def handle_noargs(self, **options):
        requeue_failures()