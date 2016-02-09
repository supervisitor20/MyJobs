# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ImportRecord'
        db.create_table(u'import_jobs_importrecord', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('buid', self.gf('django.db.models.fields.IntegerField')(db_index=True)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, db_index=True, blank=True)),
            ('success', self.gf('django.db.models.fields.BooleanField')()),
        ))
        db.send_create_signal(u'import_jobs', ['ImportRecord'])


    def backwards(self, orm):
        # Deleting model 'ImportRecord'
        db.delete_table(u'import_jobs_importrecord')


    models = {
        u'import_jobs.importrecord': {
            'Meta': {'object_name': 'ImportRecord'},
            'buid': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'db_index': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'success': ('django.db.models.fields.BooleanField', [], {})
        }
    }

    complete_apps = ['import_jobs']