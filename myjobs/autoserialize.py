from django.http import HttpResponse
import json
from functools import wraps


def autoserialize_view_decorator(fn):
    @wraps(fn)
    def handle_autoserialize(request):
        if "callback" in request.GET:
            callback = request.GET['callback']
            content_type = "text/javascript"
        else:
            callback = None
            content_type = "application/json"

        response = fn(request)

        payload = json.dumps(response)
        if callback is not None:
            content = "%s(%s)" % (callback, payload)
        else:
            content = payload
        return HttpResponse(content=content, content_type=content_type)
    return handle_autoserialize
