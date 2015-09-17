import re
import logging
from django.http import HttpResponse

from functools import wraps
from universal.helpers import get_domain
from seo.models import SeoSite
from urlparse import urlparse, parse_qs


XRW = 'XMLHttpRequest'
logger = logging.getLogger(__name__)


class DomainRelationshipException(Exception):
    pass


def extract_hostname(url):
    if url is None:
        return None
    else:
        return urlparse(url).hostname


def extract_hostname_from_header(header):
    if header is None:
        return header
    match = re.match(r'(.*):[0-9]+$', header)
    if match:
        return match.group(1)
    else:
        return header


def parse_request_meta(meta):
    method = meta.get('REQUEST_METHOD', '')

    host = extract_hostname_from_header(meta.get('HTTP_HOST'))

    origin = extract_hostname(meta.get('HTTP_ORIGIN'))

    referer = extract_hostname(meta.get('HTTP_REFERER'))

    xrw = meta.get('HTTP_X_REQUESTED_WITH')

    qs = meta.get('QUERY_STRING', '')

    qsreferer = parse_qs(qs).get('referer', [None])[0]

    return (method, host, origin, referer, qsreferer, xrw)


def guess_child_domain(host, origin, referer, qsreferer):
    if origin is not None:
        return origin

    if referer is not None:
        return referer

    if qsreferer is not None:
        if qsreferer == host:
            return qsreferer
        else:
            raise DomainRelationshipException('qsreferer-not-host')

    raise DomainRelationshipException('no-child-info')


def fail():
    return HttpResponse(status=404, content="not found")


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
    if len(sites) != 1:
        return None
    return sites[0]


def verify_cross_site_request(site_loader, method, host, origin,
                              referer, xrw, qsreferer):
    if not is_permitted_method(method):
        raise DomainRelationshipException('method')

    host_site = site_loader(host)

    if host_site is None:
        raise DomainRelationshipException('host-unknown')

    if not is_parent(host_site):
        raise DomainRelationshipException('host-not-parent')

    child = guess_child_domain(host, origin, referer, qsreferer)

    child_site = site_loader(child)
    if not is_self_or_child(host_site, child_site):
        raise DomainRelationshipException('not-child-of-parent')

    if method in ('POST', 'OPTIONS'):
        if not xrw_ok(xrw):
            raise DomainRelationshipException('bad-xrw')


def cross_site_verify(fn):
    @wraps(fn)
    def verify(request):
        method, host, origin, referer, qsreferer, xrw = (
            parse_request_meta(request.META))

        try:
            verify_cross_site_request(get_site, method, host, origin,
                                      referer, xrw, qsreferer)
        except DomainRelationshipException as e:
            data = (("method: %r, host %r, origin %r, " +
                     "referer %r, qsreferer %r, xrw %r") %
                    (method, host, origin, referer, qsreferer, xrw))
            logger.warn(
                "Rejected cross site request; reason : %s\n" +
                "data: %s", e.message, data)
            return fail()
        return fn(request)

    return verify
