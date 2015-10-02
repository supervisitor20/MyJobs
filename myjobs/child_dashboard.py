from django.views.decorators.csrf import (
    csrf_exempt as django_csrf_exempt)

from myjobs.autoserialize import autoserialize
from myjobs.cross_site_verify import cross_site_verify


# The django csrf exemption should stay first in this list.
@django_csrf_exempt
@cross_site_verify
@autoserialize
def child_dashboard(request):
    return {'start_here': 'fill in return data'}
