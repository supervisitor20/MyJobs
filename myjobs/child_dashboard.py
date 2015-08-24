from django.http import HttpResponse

from myjobs.autoserialize import autoserialize


@autoserialize
def child_dashboard(request):
    return {'start_here': 'fill in return data'}
