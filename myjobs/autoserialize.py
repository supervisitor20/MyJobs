from django.http import HttpResponse
import json
from functools import wraps


def autoserialize(fn):
    """
    Wrap API. If the API receives a JSONP call, wrap the response in the
    given callback function.

    :param fn: wrapped function
    :return: return wrapped in callback, if jsonp
    """
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
