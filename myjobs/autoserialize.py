from django.http import HttpResponse
import json
from functools import wraps


def autoserialize_view_decorator(fn):
    @wraps(fn)
    def handle_autoserialize(request):
        response = fn(request)

        payload = json.dumps(response)
        if "callback" in request.GET:
            callback = request.GET['callback']
            content = "%s(%s)" % (callback, payload)
            content_type = "text/javascript"
        else:
            content = payload
            content_type = "application/json"
        return HttpResponse(content=content, content_type=content_type)
    return handle_autoserialize
