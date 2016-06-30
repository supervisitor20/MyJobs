import datetime
import math
from slugify import slugify
from solrsitemap import SolrSitemap

from django.conf import settings
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import NoReverseMatch, reverse

from seo.search_backend import DESearchQuerySet
from seo.helpers import sqs_apply_custom_facets


class DESolrSitemap(SolrSitemap):
    """
    Parse the jobs for a particular domain and return a sitemap. This
    generates a sitemap-pages.xml file for all microsites that contains
    all the URLS on the site, its frequency of update, and when it was
    last modified, for web crawlers to use for indexing.

    This sitemap is "lazy" compared to Django's built-in Sitemap, in that
    it does not fetch the data needed to compute all the URLs at once.
    Instead of using Django's built-in pagination, we delegate pagination
    operations to Solr itself using its `start` and `rows` parameters.

    """
    # Required solr document fields. date_new is used by lastmod()
    required_fields = ['date_new']

    def __init__(self, fields=None, queryclass=DESearchQuerySet, **kwargs):
        # 'fields' is an iterable of field names that correspond to fields in
        # the index. Whatever fields you would put into the 'fl' parameter for
        # Solr's API are the same fields that should be present in the 'fields'
        # kwarg.
        self.limit = 6000
        self.fields = fields or []
        self.fields.extend(self.required_fields)
        self.buids = settings.SITE_BUIDS
        self.buid_str = " OR ".join([str(i) for i in self.buids])
        super(DESolrSitemap, self).__init__(queryclass=queryclass, **kwargs)

    def _sqs(self):
        sqs = super(DESolrSitemap, self)._sqs()._clone()
        sqs = sqs.order_by('-date_new')

        if self.buids:
            sqs = sqs.narrow("buid:(%s)" % self.buid_str)

        sqs = sqs_apply_custom_facets(settings.DEFAULT_FACET, sqs)

        if self.fields:
            sqs = sqs.fields(self.fields)

        return sqs

    def changefreq(self, obj):
        """How frequently the sitemap is likely to change"""
        return "monthly"

    def lastmod(self, obj):
        # Creates a datetime object from date_new
        return datetime.datetime.strptime(obj.get('date_new'), "%Y-%m-%d-%H%M%S")

    def priority(self, obj):
        if obj['type'] == 'job_detail':
            return 1.0

    def location(self, obj):
        # Mapping of URL types to the data associated with each type. This
        # allows us to build out the arguments to our ``reverse`` call
        # while avoiding writing (and more importantly, maintaining) a bunch of
        # boilerplate.
        paths = {
            'location': {
                'name': 'location',
                'kwargs': ['location']
            },
            'title_location': {
                'name': 'title_location',
                'kwargs': ['location', 'title']
            },
            'job_detail': {
                'name': 'job_detail_by_location_slug_title_slug_job_id',
                'kwargs': ['location', 'title', 'uid']
            }
        }
        # Mapping of ``obj`` keys to keyword arguments that must be passed to
        # the view specified. As with the ``paths`` dictionary, this is being
        # used to eliminate repetitive code that is difficult to maintain.
        fields = {
            'location': 'location_slug',
            'title': 'title_slug',
            'uid': 'job_id'
        }
        info = paths[obj['type']]
        kwargs = dict((fields[i], obj[i]) for i in info['kwargs'])
        return reverse(info['name'], kwargs=kwargs)

    def get_urls(self, site=None):
        if site is None:
            if Site._meta.installed:
                try:
                    site = Site.objects.get_current()
                except Site.DoesNotExist:
                    pass
            if site is None:
                raise ImproperlyConfigured("""In order to use Sitemaps you must\
                                            either use the sites framework or\
                                            pass in a Site or RequestSite\
                                            object in your view code.""")

        urls = []
        sitemap_view_source = settings.FEED_VIEW_SOURCES.get('sitemap', 28)
        for item in self.items():
            # If there's some data in the job feed that is not recognized by
            # our url patterns, it will cause `reverse()` to throw a
            # `NoReverseMatch` exception. If we don't catch that here, it will
            # cause the entire sitemap page to return a 500. We want to just
            # exclude the link to that job.
            try:
                loc = "http://%s/%s%d" % (site.domain, item['guid'],
                                          sitemap_view_source)
            except NoReverseMatch:
                continue
            else:
                priority = self.priority(item)
                url_info = {
                    'location':   loc,
                    'lastmod':    self.lastmod(item),
                    'changefreq': self.changefreq(item),
                    'priority':   str(priority is not None and priority or '')
                }
                urls.append(url_info)
        return urls

    def items(self):
        """
        Return a list of dictionaries needed to create the URLs.
        In format field:value

        """
        start = int(self.pagenum) * self.limit
        end = start + self.limit
        results = self.results.values(
            *self.fields)[start:end]
        items = []

        for d in results:
            # If there are any values in the dictionary that, when slugified,
            # yield empty strings, continue without evaluating further.
            if not all([slugify(v) for v in d.values()]):
                continue

            ret = dict((k, slugify(v)) for k, v in d.items())
            ret['type'] = 'job_detail'
            items.append(ret)

        return items
