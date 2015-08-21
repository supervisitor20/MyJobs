#  -*- coding: utf-8 -*-
import os
import json

from django.conf import settings

from seo_pysolr import Solr
import import_jobs
from seo.tests import factories
from seo.models import SeoSite
from setup import DirectSEOBase


class SiteTestCase(DirectSEOBase):
    """
        This test case is intended to verify the context processors are being
        properly run and the values needed are being added to the context.
    """
    def setUp(self):
        super(SiteTestCase, self).setUp()
        # self.conn = Solr('http://127.0.0.1:8983/solr/seo')
        # self.conn.delete(q="*:*")
        # self.businessunit = factories.BusinessUnitFactory(id=0)
        # self.buid = self.businessunit.id
        # self.filepath = os.path.join(import_jobs.DATA_DIR,
        #                              'dseo_feed_%s.xml' % self.buid)
        SeoSite.objects.all().delete()
        self.site = factories.SeoSiteFactory(id=1)
        settings.SITE = self.site
        settings.SITE_ID = self.site.pk
        self.configuration = factories.ConfigurationFactory(status=2)
        self.configuration.save()
        self.site.configurations.clear()
        self.site.configurations.add(self.configuration)
    
    # def tearDown(self):
    #     super(SiteTestCase, self).tearDown()
    #     self.conn.delete(q="*:*")
    def test_site_config():
        
        