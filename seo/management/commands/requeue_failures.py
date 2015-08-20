import ast
from django.core.management.base import NoArgsCommand
from djcelery.models import TaskState
from datetime import datetime, timedelta
from tasks import requeue_failures

class Command(NoArgsCommand):
    args = 'None'
    help = 'REqueues tasks that failed in the last eight hours.'

    def handle_noargs(self, **options):
        requeue_failures()