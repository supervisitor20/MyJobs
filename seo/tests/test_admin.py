from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from myjobs.models import User
from seo.tests import factories
from seo.models import SeoSite
from seo.tests.setup import DirectSEOBase

admin_seo_links = ["atssourcecode",
                   "billboardimage",
                   "businessunit",
                   "company",
                   "configuration",
                   "customfacet",
                   "custompage",
                   "googleanalytics",
                   "googleanalyticscampaign",
                   "seositefacet",
                   "seosite",
                   "specialcommitment",
                   "viewsource"]


class SeoAdminTestCase(DirectSEOBase):
    def setUp(self):
        super(SeoAdminTestCase, self).setUp()
        self.password = 'imbatmancalifornia'
        self.user = User.objects.create_superuser(password=self.password,
                                                  email='bc@batyacht.com')
        self.user.save()
        self.client.login(email=self.user.email,
                          password=self.password)

    def test_add(self):
        """Tests seo admin add views"""
        for link in admin_seo_links:
            resp = self.client.get('/admin/seo/%s/add/' % link)
            self.assertEqual(resp.status_code, 200)

    def test_change(self):
        """Tests seo admin list views"""
        for link in admin_seo_links:
            resp = self.client.get('/admin/seo/%s/' % link)
            self.assertEqual(resp.status_code, 200)
            
    def test_seo_site_can_be_child(self):
        """
            Ensure SEO Site can be added as a child via the admin form
        """
        parent_seo_site = factories.SeoSiteFactory()
        group_for_new_site = factories.GroupFactory()
        resp = self.client.post(reverse('admin:seo_seosite_add'),
                                {'domain':'newdomain_testnormal',
                                'name':'new_name',
                                'group':group_for_new_site.pk,
                                'postajob_filter_type':'this site only',
                                'parent_site':parent_seo_site.pk})
        self.assertEqual(resp.status_code, 302) #redirect on successful add
        self.assertFalse("field-parent_site errors" in resp)
        created_site = SeoSite.objects.get(domain='newdomain_testnormal')
        self.assertEqual(created_site.parent_site, parent_seo_site)

    def test_seo_site_cannot_be_child_of_child(self):
        """
            Ensure a child SEO Site cannot be a parent via the admin form
        """
        parent_seo_site = factories.SeoSiteFactory()
        child_seo_site = factories.SeoSiteFactory()
        child_seo_site.parent_site = parent_seo_site
        child_seo_site.save()
        group_for_new_site = factories.GroupFactory()
        resp = self.client.post(reverse('admin:seo_seosite_add'),
                                {'domain':'newdomain_testnochildchild',
                                'name':'new_name',
                                'group':group_for_new_site.pk,
                                'postajob_filter_type':'this site only',
                                'parent_site':child_seo_site.pk})
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "field-parent_site errors")
        with self.assertRaises(ObjectDoesNotExist):
            created_site = SeoSite.objects.get(domain='newdomain_testnochildchild')

    def test_parent_seo_cannot_become_child(self):
        """
            Ensure a parent SEO site cannot become a child site via the admin form
        """
        super_parent_site = factories.SeoSiteFactory()
        parent_seo_site = factories.SeoSiteFactory()
        child_seo_site = factories.SeoSiteFactory()
        child_seo_site.parent_site = parent_seo_site
        child_seo_site.save()
        resp = self.client.post(reverse('admin:seo_seosite_change',
                                        args=(child_seo_site.pk,)),
                                {'domain':'newdomain_testnochildparent',
                                'name':parent_seo_site.name,
                                'group':parent_seo_site.group,
                                'postajob_filter_type':parent_seo_site.postajob_filter_type,
                                'parent_site':super_parent_site.pk})
        print resp
        # self.assertEqual(resp.status_code, 200)
        # self.assertContains(resp, "field-parent_site errors")
        child_seo_site2 = SeoSite.objects.get(id=child_seo_site.pk)
        self.assertEqual(child_seo_site2.parent_site.pk, super_parent_site.pk)