# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Configuration.show_saved_search_widget'
        db.add_column(u'seo_configuration', 'show_saved_search_widget',
                      self.gf('django.db.models.fields.BooleanField')(default=False),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Configuration.show_saved_search_widget'
        db.delete_column(u'seo_configuration', 'show_saved_search_widget')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'flatpages.flatpage': {
            'Meta': {'ordering': "(u'url',)", 'object_name': 'FlatPage', 'db_table': "u'django_flatpage'"},
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'enable_comments': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'registration_required': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'sites': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['sites.Site']", 'symmetrical': 'False'}),
            'template_name': ('django.db.models.fields.CharField', [], {'max_length': '70', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '100', 'db_index': 'True'})
        },
        u'moc_coding.customcareer': {
            'Meta': {'object_name': 'CustomCareer'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'moc': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['moc_coding.Moc']"}),
            'object_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'onet': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['moc_coding.Onet']"})
        },
        u'moc_coding.moc': {
            'Meta': {'ordering': "['branch', 'code']", 'unique_together': "(('code', 'branch'),)", 'object_name': 'Moc'},
            'branch': ('django.db.models.fields.CharField', [], {'max_length': '11'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '20', 'db_index': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'moc_detail': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['moc_coding.MocDetail']", 'unique': 'True', 'null': 'True'}),
            'onets': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['moc_coding.Onet']", 'symmetrical': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'title_slug': ('django.db.models.fields.SlugField', [], {'max_length': '300'})
        },
        u'moc_coding.mocdetail': {
            'Meta': {'object_name': 'MocDetail'},
            'civilian_description': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'military_description': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'primary_value': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'service_branch': ('django.db.models.fields.CharField', [], {'max_length': '2'})
        },
        u'moc_coding.onet': {
            'Meta': {'unique_together': "(('title', 'code'),)", 'object_name': 'Onet'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '10', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '300'})
        },
        u'seo.atssourcecode': {
            'Meta': {'object_name': 'ATSSourceCode'},
            'ats_name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'value': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'})
        },
        u'seo.billboardhotspot': {
            'Meta': {'object_name': 'BillboardHotspot'},
            'billboard_image': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.BillboardImage']"}),
            'border_color': ('django.db.models.fields.CharField', [], {'default': "'FFFFFF'", 'max_length': '6'}),
            'display_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'font_color': ('django.db.models.fields.CharField', [], {'default': "'FFFFFF'", 'max_length': '6'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'offset_x': ('django.db.models.fields.IntegerField', [], {}),
            'offset_y': ('django.db.models.fields.IntegerField', [], {}),
            'primary_color': ('django.db.models.fields.CharField', [], {'default': "'5A6D81'", 'max_length': '6'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '140'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'seo.billboardimage': {
            'Meta': {'object_name': 'BillboardImage'},
            'copyright_info': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'logo_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'source_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'sponsor_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'seo.businessunit': {
            'Meta': {'object_name': 'BusinessUnit'},
            'associated_jobs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'date_crawled': ('django.db.models.fields.DateTimeField', [], {}),
            'date_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'enable_markdown': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'federal_contractor': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'id': ('django.db.models.fields.IntegerField', [], {'max_length': '10', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'title_slug': ('django.db.models.fields.SlugField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'})
        },
        u'seo.city': {
            'Meta': {'object_name': 'City'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'db_index': 'True'}),
            'nation': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.Country']"})
        },
        u'seo.company': {
            'Meta': {'ordering': "['name']", 'object_name': 'Company'},
            'canonical_microsite': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'company_slug': ('django.db.models.fields.SlugField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'digital_strategies_customer': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'enhanced': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'job_source_ids': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['seo.BusinessUnit']", 'symmetrical': 'False'}),
            'linkedin_id': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'logo_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'member': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'og_img': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'seo.configuration': {
            'Meta': {'object_name': 'Configuration'},
            'backgroundColor': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'body': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'browse_city_order': ('django.db.models.fields.IntegerField', [], {'default': '5'}),
            'browse_city_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_city_text': ('django.db.models.fields.CharField', [], {'default': "'City'", 'max_length': '50'}),
            'browse_company_order': ('django.db.models.fields.IntegerField', [], {'default': '7'}),
            'browse_company_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'browse_company_text': ('django.db.models.fields.CharField', [], {'default': "'Company'", 'max_length': '50'}),
            'browse_country_order': ('django.db.models.fields.IntegerField', [], {'default': '3'}),
            'browse_country_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_country_text': ('django.db.models.fields.CharField', [], {'default': "'Country'", 'max_length': '50'}),
            'browse_facet_order': ('django.db.models.fields.IntegerField', [], {'default': '2'}),
            'browse_facet_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'browse_facet_text': ('django.db.models.fields.CharField', [], {'default': "'Job Profiles'", 'max_length': '50'}),
            'browse_moc_order': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'browse_moc_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'browse_moc_text': ('django.db.models.fields.CharField', [], {'default': "'Military Titles'", 'max_length': '50'}),
            'browse_state_order': ('django.db.models.fields.IntegerField', [], {'default': '4'}),
            'browse_state_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_state_text': ('django.db.models.fields.CharField', [], {'default': "'State'", 'max_length': '50'}),
            'browse_title_order': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'browse_title_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_title_text': ('django.db.models.fields.CharField', [], {'default': "'Title'", 'max_length': '50'}),
            'company_tag': ('django.db.models.fields.CharField', [], {'default': "'careers'", 'max_length': '50'}),
            'css_body': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'defaultBlurb': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'defaultBlurbTitle': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'directemployers_link': ('django.db.models.fields.URLField', [], {'default': "'http://directemployers.org'", 'max_length': '200'}),
            'facet_tag': ('django.db.models.fields.CharField', [], {'default': "'new-jobs'", 'max_length': '50'}),
            'fontColor': ('django.db.models.fields.CharField', [], {'default': "'666666'", 'max_length': '6'}),
            'footer': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            'header': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'home_page_template': ('django.db.models.fields.CharField', [], {'default': "'home_page/home_page_listing.html'", 'max_length': '200'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location_tag': ('django.db.models.fields.CharField', [], {'default': "'jobs'", 'max_length': '50'}),
            'meta': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'moc_tag': ('django.db.models.fields.CharField', [], {'default': "'vet-jobs'", 'max_length': '50'}),
            'num_filter_items_to_show': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'num_job_items_to_show': ('django.db.models.fields.IntegerField', [], {'default': '15'}),
            'num_subnav_items_to_show': ('django.db.models.fields.IntegerField', [], {'default': '9'}),
            'percent_featured': ('django.db.models.fields.DecimalField', [], {'default': "'0.5'", 'max_digits': '3', 'decimal_places': '2'}),
            'primaryColor': ('django.db.models.fields.CharField', [], {'default': "'990000'", 'max_length': '6'}),
            'publisher': ('django.db.models.fields.CharField', [], {'max_length': '50', 'blank': 'True'}),
            'revision': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'secondaryColor': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'show_home_microsite_carousel': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'show_home_social_footer': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'show_saved_search_widget': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'show_social_footer': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'null': 'True', 'db_index': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True'}),
            'title_tag': ('django.db.models.fields.CharField', [], {'default': "'jobs-in'", 'max_length': '50'}),
            'useCssBody': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'view_all_jobs_detail': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'wide_footer': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'wide_header': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'seo.country': {
            'Meta': {'object_name': 'Country'},
            'abbrev': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'abbrev_short': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'db_index': 'True'})
        },
        u'seo.customfacet': {
            'Meta': {'object_name': 'CustomFacet'},
            'always_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'blurb': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'business_units': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.BusinessUnit']", 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'company': ('django.db.models.fields.CharField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'date_created': ('django.db.models.fields.DateField', [], {'auto_now': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name_slug': ('django.db.models.fields.SlugField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'onet': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'querystring': ('django.db.models.fields.CharField', [], {'max_length': '2000', 'null': 'True', 'blank': 'True'}),
            'saved_querystring': ('django.db.models.fields.CharField', [], {'max_length': '10000', 'blank': 'True'}),
            'show_blurb': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'show_production': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'url_slab': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'})
        },
        u'seo.custompage': {
            'Meta': {'ordering': "(u'url',)", 'object_name': 'CustomPage', '_ormbases': [u'flatpages.FlatPage']},
            u'flatpage_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['flatpages.FlatPage']", 'unique': 'True', 'primary_key': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True', 'blank': 'True'})
        },
        u'seo.featuredcompany': {
            'Meta': {'object_name': 'FeaturedCompany'},
            'company': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.Company']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_featured': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'seosite': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.SeoSite']"})
        },
        u'seo.googleanalytics': {
            'Meta': {'object_name': 'GoogleAnalytics'},
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'web_property_id': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        },
        u'seo.googleanalyticscampaign': {
            'Meta': {'object_name': 'GoogleAnalyticsCampaign'},
            'campaign_content': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'campaign_medium': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'campaign_name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'campaign_source': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'campaign_term': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'})
        },
        u'seo.joblisting': {
            'Meta': {'object_name': 'jobListing'},
            'city': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'citySlug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'countrySlug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'country_short': ('django.db.models.fields.CharField', [], {'db_index': 'True', 'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'date_new': ('django.db.models.fields.DateTimeField', [], {}),
            'date_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'hitkey': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'link': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'reqid': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'stateSlug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'state_short': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'titleSlug': ('django.db.models.fields.SlugField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'uid': ('django.db.models.fields.IntegerField', [], {'unique': 'True', 'db_index': 'True'}),
            'zipcode': ('django.db.models.fields.CharField', [], {'max_length': '15', 'null': 'True', 'blank': 'True'})
        },
        u'seo.seosite': {
            'Meta': {'ordering': "('domain',)", 'object_name': 'SeoSite', '_ormbases': [u'sites.Site']},
            'ats_source_codes': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.ATSSourceCode']", 'null': 'True', 'blank': 'True'}),
            'billboard_images': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.BillboardImage']", 'null': 'True', 'blank': 'True'}),
            'business_units': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.BusinessUnit']", 'null': 'True', 'blank': 'True'}),
            'configurations': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['seo.Configuration']", 'symmetrical': 'False', 'blank': 'True'}),
            'facets': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.CustomFacet']", 'null': 'True', 'through': u"orm['seo.SeoSiteFacet']", 'blank': 'True'}),
            'featured_companies': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.Company']", 'null': 'True', 'blank': 'True'}),
            'google_analytics': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.GoogleAnalytics']", 'null': 'True', 'blank': 'True'}),
            'google_analytics_campaigns': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.GoogleAnalyticsCampaign']", 'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            'microsite_carousel': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['social_links.MicrositeCarousel']", 'null': 'True', 'on_delete': 'models.SET_NULL', 'blank': 'True'}),
            'site_description': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
            'site_heading': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
            u'site_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['sites.Site']", 'unique': 'True', 'primary_key': 'True'}),
            'site_tags': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.SiteTag']", 'null': 'True', 'blank': 'True'}),
            'site_title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
            'special_commitments': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['seo.SpecialCommitment']", 'null': 'True', 'blank': 'True'}),
            'view_sources': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.ViewSource']", 'null': 'True', 'blank': 'True'})
        },
        u'seo.seositefacet': {
            'Meta': {'object_name': 'SeoSiteFacet'},
            'boolean_operation': ('django.db.models.fields.CharField', [], {'default': "'or'", 'max_length': '3', 'db_index': 'True'}),
            'customfacet': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.CustomFacet']"}),
            'facet_type': ('django.db.models.fields.CharField', [], {'default': "'STD'", 'max_length': '4', 'db_index': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'seosite': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.SeoSite']"})
        },
        u'seo.seositeredirect': {
            'Meta': {'unique_together': "(['redirect_url', 'seosite'],)", 'object_name': 'SeoSiteRedirect'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'redirect_url': ('django.db.models.fields.CharField', [], {'max_length': '100', 'db_index': 'True'}),
            'seosite': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.SeoSite']"})
        },
        u'seo.shared_sessions': {
            'Meta': {'object_name': 'Shared_Sessions', 'db_table': "'myjobs_shared_sessions'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mj_session': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'ms_session': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.User']", 'unique': 'True'})
        },
        u'seo.sitetag': {
            'Meta': {'object_name': 'SiteTag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'site_tag': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'tag_navigation': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'seo.specialcommitment': {
            'Meta': {'object_name': 'SpecialCommitment'},
            'commit': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'seo.state': {
            'Meta': {'unique_together': "(('name', 'nation'),)", 'object_name': 'State'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'db_index': 'True'}),
            'nation': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.Country']"})
        },
        u'seo.ticket': {
            'Meta': {'unique_together': "(['ticket', 'user'],)", 'object_name': 'Ticket', 'db_table': "'myjobs_ticket'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ticket': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['seo.User']"})
        },
        u'seo.user': {
            'Meta': {'object_name': 'User', 'db_table': "'myjobs_user'"},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '255', 'db_index': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'gravatar': ('django.db.models.fields.EmailField', [], {'db_index': 'True', 'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_disabled': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'last_response': ('django.db.models.fields.DateField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'opt_in_employers': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'opt_in_myjobs': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'password_change': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'profile_completion': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'user_guid': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'seo.viewsource': {
            'Meta': {'object_name': 'ViewSource'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'view_source': ('django.db.models.fields.IntegerField', [], {'default': "''", 'max_length': '20'})
        },
        u'sites.site': {
            'Meta': {'ordering': "('domain',)", 'object_name': 'Site', 'db_table': "'django_site'"},
            'domain': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'social_links.micrositecarousel': {
            'Meta': {'object_name': 'MicrositeCarousel'},
            'carousel_title': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'display_rows': ('django.db.models.fields.IntegerField', [], {}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'include_all_sites': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'link_sites': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'linked_carousel'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['seo.SeoSite']"})
        },
        u'social_links.sociallink': {
            'Meta': {'object_name': 'SocialLink'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.Group']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'link_icon': ('django.db.models.fields.CharField', [], {'default': "'default'", 'max_length': '255'}),
            'link_title': ('django.db.models.fields.CharField', [], {'max_length': '60', 'db_index': 'True'}),
            'link_type': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'link_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'sites': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['seo.SeoSite']", 'symmetrical': 'False'})
        },
        u'taggit.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100'})
        },
        u'taggit.taggeditem': {
            'Meta': {'object_name': 'TaggedItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'taggit_taggeditem_tagged_items'", 'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'taggit_taggeditem_items'", 'to': u"orm['taggit.Tag']"})
        }
    }

    complete_apps = ['seo']