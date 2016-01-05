from seo.cache import get_site_config, get_secure_blocks_site, \
    get_url_prefix_qc_staging


def site_config_context(request):
    return {'site_config': get_site_config(request),
            'testing_host_prefix': get_url_prefix_qc_staging(request),
            'secure_blocks_domain': get_secure_blocks_site(request)}
