# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Rename field 'Configuration.disambigNumber'
        db.rename_column('seo_configuration', 'disambigNumber', 'num_filter_items_to_show')


    def backwards(self, orm):

        # Rename field 'Configuration.num_filter_items_to_show'
        db.delete_column('seo_configuration', 'num_filter_items_to_show', 'disambigNumber')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'seo.businessunit': {
            'Meta': {'object_name': 'BusinessUnit'},
            'associated_jobs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'date_crawled': ('django.db.models.fields.DateTimeField', [], {}),
            'date_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.IntegerField', [], {'max_length': '10', 'primary_key': 'True'}),
            'scheduled': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'})
        },
        'seo.configuration': {
            'Meta': {'object_name': 'Configuration'},
            'backgroundColor': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'browse_city_order': ('django.db.models.fields.IntegerField', [], {'default': '3'}),
            'browse_city_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_city_text': ('django.db.models.fields.CharField', [], {'default': "'City'", 'max_length': '50'}),
            'browse_country_order': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'browse_country_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_country_text': ('django.db.models.fields.CharField', [], {'default': "'Country'", 'max_length': '50'}),
            'browse_facet_order': ('django.db.models.fields.IntegerField', [], {'default': '5'}),
            'browse_facet_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'browse_facet_text': ('django.db.models.fields.CharField', [], {'default': "'Job Profiles'", 'max_length': '50'}),
            'browse_state_order': ('django.db.models.fields.IntegerField', [], {'default': '2'}),
            'browse_state_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_state_text': ('django.db.models.fields.CharField', [], {'default': "'State'", 'max_length': '50'}),
            'browse_title_order': ('django.db.models.fields.IntegerField', [], {'default': '4'}),
            'browse_title_show': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'browse_title_text': ('django.db.models.fields.CharField', [], {'default': "'Title'", 'max_length': '50'}),
            'career_site_link': ('django.db.models.fields.URLField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
            'career_site_text': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
            'css_body': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'defaultBlurb': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'defaultBlurbTitle': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'directemployers_link': ('django.db.models.fields.URLField', [], {'default': "'http://directemployers.org'", 'max_length': '200'}),
            'facet_tag': ('django.db.models.fields.CharField', [], {'default': "'new-jobs'", 'max_length': '50'}),
            'fontColor': ('django.db.models.fields.CharField', [], {'default': "'666666'", 'max_length': '6'}),
            'footer': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.Group']", 'null': 'True'}),
            'header': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location_tag': ('django.db.models.fields.CharField', [], {'default': "'jobs'", 'max_length': '50'}),
            'meta': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'num_filter_items_to_show': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'num_job_items_to_show': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'primaryColor': ('django.db.models.fields.CharField', [], {'default': "'990000'", 'max_length': '6'}),
            'secondaryColor': ('django.db.models.fields.CharField', [], {'max_length': '6', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'null': 'True', 'blank': 'True'}),
            'subNavNumber': ('django.db.models.fields.IntegerField', [], {'default': '9'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True'}),
            'title_tag': ('django.db.models.fields.CharField', [], {'default': "'jobs-in'", 'max_length': '50'}),
            'useCssBody': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'wide_footer': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'wide_header': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        'seo.facet': {
            'Meta': {'object_name': 'facet'},
            'always_show': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'childFacet': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['seo.facet']", 'symmetrical': 'False', 'blank': 'True'}),
            'default_country': ('django.db.models.fields.CharField', [], {'default': "'USA'", 'max_length': '3'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'facetSlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.Group']", 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jobListing': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['seo.jobListing']", 'symmetrical': 'False', 'through': "orm['seo.facetJob']", 'blank': 'True'}),
            'show_description': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'show_production': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'seo.facetjob': {
            'Meta': {'object_name': 'facetJob'},
            'facet': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['seo.facet']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'jobListing': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['seo.jobListing']"})
        },
        'seo.facetrule': {
            'Meta': {'object_name': 'facetRule'},
            'cityTerm': ('django.db.models.fields.CharField', [], {'max_length': '800', 'blank': 'True'}),
            'countryTerm': ('django.db.models.fields.CharField', [], {'max_length': '800', 'blank': 'True'}),
            'facet': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['seo.facet']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'keywordTerm': ('django.db.models.fields.CharField', [], {'max_length': '800', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'stateTerm': ('django.db.models.fields.CharField', [], {'max_length': '800', 'blank': 'True'}),
            'titleTerm': ('django.db.models.fields.CharField', [], {'max_length': '800', 'blank': 'True'})
        },
        'seo.googleanalytics': {
            'Meta': {'object_name': 'GoogleAnalytics'},
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.Group']", 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'web_property_id': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        },
        'seo.joblisting': {
            'Meta': {'object_name': 'jobListing'},
            'buid': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['seo.BusinessUnit']"}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'citySlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'countrySlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'country_short': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'date_new': ('django.db.models.fields.DateTimeField', [], {}),
            'date_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'f_city': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'f_country': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'f_onet_title': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'f_state': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'f_title': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'hitkey': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'link': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'onetTitleSlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'onet_code': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'onet_title': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'reqid': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'stateSlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'state_short': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'titleSlug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'uid': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'})
        },
        'seo.seosite': {
            'Meta': {'ordering': "('domain',)", 'object_name': 'SeoSite', '_ormbases': ['sites.Site']},
            'business_units': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['seo.BusinessUnit']", 'null': 'True', 'blank': 'True'}),
            'configurations': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['seo.Configuration']", 'symmetrical': 'False', 'blank': 'True'}),
            'default_facet': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'filtered_sites'", 'null': 'True', 'to': "orm['seo.facet']"}),
            'facets': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['seo.facet']", 'null': 'True', 'blank': 'True'}),
            'google_analytics': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['seo.GoogleAnalytics']", 'null': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.Group']", 'null': 'True'}),
            'site_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['sites.Site']", 'unique': 'True', 'primary_key': 'True'})
        },
        'seo.seositeredirect': {
            'Meta': {'object_name': 'SeoSiteRedirect'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'redirect_url': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'seosite': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['seo.SeoSite']"})
        },
        'sites.site': {
            'Meta': {'ordering': "('domain',)", 'object_name': 'Site', 'db_table': "'django_site'"},
            'domain': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['seo']
