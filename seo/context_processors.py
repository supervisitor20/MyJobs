from seo.cache import get_site_config, get_secure_blocks_site, \
    is_testing_environment


def site_config_context(request):
    return {'site_config': get_site_config(request),
            'is_testing_environment': is_testing_environment(request),
            'secure_blocks_domain': get_secure_blocks_site(request)}
