from django.http import HttpResponse

from myjobs.autoserialize import autoserialize
from myjobs.cross_site_verify import cross_site_verify


@cross_site_verify
@autoserialize
def child_dashboard(request):
    return {'start_here': 'fill in return data'}
