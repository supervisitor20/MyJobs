# -*- coding: utf-8 -*-
# Generated by Django 1.9.10 on 2016-10-21 11:52
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('mypartners', '0001_initial'),
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('seo', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tag',
            name='company',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='seo.Company'),
        ),
        migrations.AddField(
            model_name='tag',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='status',
            name='approved_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='prmattachment',
            name='contact_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.ContactRecord'),
        ),
        migrations.AddField(
            model_name='partner',
            name='approval_status',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='mypartners.Status', verbose_name=b'Approval Status'),
        ),
        migrations.AddField(
            model_name='partner',
            name='library',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.PartnerLibrary'),
        ),
        migrations.AddField(
            model_name='partner',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='seo.Company'),
        ),
        migrations.AddField(
            model_name='partner',
            name='primary_contact',
            field=models.ForeignKey(blank=True, help_text=b'Denotes who the primary contact is for this organization.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='primary_contact', to='mypartners.Contact'),
        ),
        migrations.AddField(
            model_name='partner',
            name='tags',
            field=models.ManyToManyField(help_text=b"ie 'Disability', 'veteran-outreach', etc. Separate tags with a comma.", null=True, to='mypartners.Tag'),
        ),
        migrations.AddField(
            model_name='outreachrecord',
            name='communication_records',
            field=models.ManyToManyField(to='mypartners.ContactRecord'),
        ),
        migrations.AddField(
            model_name='outreachrecord',
            name='contacts',
            field=models.ManyToManyField(to='mypartners.Contact'),
        ),
        migrations.AddField(
            model_name='outreachrecord',
            name='current_workflow_state',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mypartners.OutreachWorkflowState'),
        ),
        migrations.AddField(
            model_name='outreachrecord',
            name='outreach_email',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mypartners.OutreachEmailAddress'),
        ),
        migrations.AddField(
            model_name='outreachrecord',
            name='partners',
            field=models.ManyToManyField(to='mypartners.Partner'),
        ),
        migrations.AddField(
            model_name='outreachemaildomain',
            name='company',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='seo.Company'),
        ),
        migrations.AddField(
            model_name='outreachemailaddress',
            name='company',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='seo.Company'),
        ),
        migrations.AddField(
            model_name='contactrecord',
            name='approval_status',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='mypartners.Status', verbose_name=b'Approval Status'),
        ),
        migrations.AddField(
            model_name='contactrecord',
            name='contact',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.Contact'),
        ),
        migrations.AddField(
            model_name='contactrecord',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='contactrecord',
            name='partner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.Partner'),
        ),
        migrations.AddField(
            model_name='contactrecord',
            name='tags',
            field=models.ManyToManyField(null=True, to='mypartners.Tag'),
        ),
        migrations.AddField(
            model_name='contactlogentry',
            name='content_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType'),
        ),
        migrations.AddField(
            model_name='contactlogentry',
            name='impersonator',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='impersonator', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='contactlogentry',
            name='partner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.Partner'),
        ),
        migrations.AddField(
            model_name='contactlogentry',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='contact',
            name='approval_status',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='mypartners.Status', verbose_name=b'Approval Status'),
        ),
        migrations.AddField(
            model_name='contact',
            name='library',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.PartnerLibrary'),
        ),
        migrations.AddField(
            model_name='contact',
            name='locations',
            field=models.ManyToManyField(related_name='contacts', to='mypartners.Location'),
        ),
        migrations.AddField(
            model_name='contact',
            name='partner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='mypartners.Partner'),
        ),
        migrations.AddField(
            model_name='contact',
            name='tags',
            field=models.ManyToManyField(null=True, to='mypartners.Tag'),
        ),
        migrations.AddField(
            model_name='contact',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='tag',
            unique_together=set([('name', 'company')]),
        ),
        migrations.AlterUniqueTogether(
            name='outreachemaildomain',
            unique_together=set([('company', 'domain')]),
        ),
    ]
