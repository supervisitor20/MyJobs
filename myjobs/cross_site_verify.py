import logging
from django.http import HttpResponse
from django.conf import settings

from functools import wraps
from seo.models import SeoSite
from urlparse import urlparse


XRW = 'XMLHttpRequest'
logger = logging.getLogger(__name__)


class DomainRelationshipException(Exception):
    pass


def extract_hostname(url):
    if url is None:
        return None
    else:
        return urlparse(url).hostname


def parse_request_meta(meta):
    method = meta.get('REQUEST_METHOD', '')

    origin = extract_hostname(meta.get('HTTP_ORIGIN'))

    referer = extract_hostname(meta.get('HTTP_REFERER'))

    xrw = meta.get('HTTP_X_REQUESTED_WITH')

    return (method, origin, referer, xrw)


def guess_child_domain(host, origin, referer):
    if origin is not None:
        return origin

    if referer is not None:
        return referer

    raise DomainRelationshipException('no-child-info')


def return_404(return_message="not found"):
    """
    Return a HttpResponse with a status code of 404. This is used in lieu
    of raise Http404 due to middleware issues that were encountered. This
    can be fleshed out in the future to contain varied content messages.
    :return: HttpResponse 404
    
    """
    return HttpResponse(status=404, content=return_message)


def is_permitted_method(method):
    return method in ('GET', 'POST', 'OPTIONS')


def is_parent(site):
    return site.parent_site is None


def is_parent_self_call(host_site, origin_site):
    return origin_site.id == host_site.id


def is_child_of_parent(host_site, origin_site):
    if origin_site.parent_site is None:
        return False
    return origin_site.parent_site.id == host_site.id


def is_self_or_child(host_site, origin_site):
    return (is_parent_self_call(host_site, origin_site) or
            is_child_of_parent(host_site, origin_site))


def xrw_ok(xrw):
    return xrw == XRW


def get_site(domain):
    sites = SeoSite.objects.filter(domain=domain)
    if len(sites) == 0:
        raise DomainRelationshipException('not-valid-network-site')
    elif len(sites) > 1:
        raise DomainRelationshipException('duplicate-domain-for-site')
    return sites[0]


def verify_cross_site_request(site_loader, method, host_site, origin,
                              referer, xrw):
    if not is_permitted_method(method):
        raise DomainRelationshipException('method')

    if host_site is None:
        raise DomainRelationshipException('host-unknown')

    if not is_parent(host_site):
        raise DomainRelationshipException('host-not-parent')

    child = guess_child_domain(host_site.domain, origin, referer)

    child_site = site_loader(child)
    if not is_self_or_child(host_site, child_site):
        raise DomainRelationshipException('not-child-of-parent')

    if method in ('POST', 'OPTIONS'):
        if not xrw_ok(xrw):
            raise DomainRelationshipException('bad-xrw')


def cross_site_verify(fn):
    """
    Decorator for use with cross site verified APIs. In the event of a request,
    this function verifies that the host site is a parent of the origin
    (calling) site.

    :param fn: wrapped API function
    :return: wrapped function call or 404 if error

    """
    @wraps(fn)
    def verify(request):
        method, origin, referer, xrw = (
            parse_request_meta(request.META))

        host_site = settings.SITE

        try:
            verify_cross_site_request(get_site, method, host_site, origin,
                                      referer, xrw)
        except DomainRelationshipException as e:
            data = (("method: %r, host %r, origin %r, " +
                     "referer %r, xrw %r") %
                    (method, host_site.domain, origin, referer, xrw))
            logger.warn(
                "Rejected cross site request; reason : %s\n" +
                "data: %s", e.message, data)
            return return_404()
        return fn(request)

    return verify
