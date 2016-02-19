from django.http import HttpResponse
import json
from functools import wraps

def inject_cookies(response, cookies):
    """
    Inject cookies into a HttpResponse object. Allows wrapped function
    to return cookie objects to be set.

    :param response: HttpResponse object
    :param cookies: List of dicts with cookie information
    :return: response with cookies added
    """
    for cookie in cookies:
        response.set_cookie(**cookie)
    return response

def autoserialize(fn):
    """
    Wrap API. If the API receives a JSONP call, wrap the response in the
    given callback function. Appends cookie objects into response if they exist

    :param fn: wrapped function
    :return: return wrapped in callback, if jsonp
    """
    @wraps(fn)
    def handle_autoserialize(request):
        response = fn(request)
        cookies = response.pop('cookies')
        payload = json.dumps(response)
        if "callback" in request.GET:
            callback = request.GET['callback']
            content = "%s(%s)" % (callback, payload)
            content_type = "text/javascript"
        else:
            content = payload
            content_type = "application/json"
        http_response = HttpResponse(content=content, content_type=content_type)
        http_response = inject_cookies(http_response, cookies)
        return http_response
    return handle_autoserialize
