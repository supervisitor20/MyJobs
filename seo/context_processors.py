from seo.cache import get_site_config, get_domain_parent


def site_config_context(request):
    return {'site_config': get_site_config(request),
            'domain_parent':get_domain_parent(request)}
