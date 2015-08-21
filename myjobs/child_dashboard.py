from django.http import HttpResponse

from myjobs.autoserialize import autoserialize_view_decorator


@autoserialize_view_decorator
def child_dashboard(request):
    return {'start_here': 'fill in return data'}
