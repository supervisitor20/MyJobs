from seo.cache import get_site_config, get_secure_blocks_site


def site_config_context(request):
    return {'site_config': get_site_config(request),
            'secure_blocks_domain': get_secure_blocks_site(request)}
