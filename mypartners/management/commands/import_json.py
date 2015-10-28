from datetime import datetime
import json
import os

from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError

from myjobs.models import User
from mypartners.models import Partner, Contact, ContactRecord, Tag, Location
from seo.models import Company

NOW = datetime.now()


def contact_from_json(contact_json, partner, overwrite_partner, user):
    overwrite_contact = contact_json['overwrite']

    if contact_json['maptoid']:
        contact = Contact.objects.get(pk=contact_json['maptoid'])
        created = False
    else:
        contact, created = Contact.objects.get_or_create(
            partner=partner,
            name=contact_json['name'])

    if created or any([overwrite_contact, overwrite_partner]):
        contact.email = contact_json.get('email', '')
        contact.phone = contact_json.get('phone', '')
        contact.notes = contact_json.get('notes', '')
        contact.last_action_time = contact_json.get('modified', NOW)
        contact.save()

        contact_tags = []
        for tag in contact_json.get('tags', []):
            new_tag, _ = Tag.objects.get_or_create(
                company=partner.owner,
                name=tag['name'])

            contact_tags.append(new_tag)

        locations = []
        for location in contact_json.get('locations', []):
            new_location = Location.objects.create(
                label=location.get('label', ''),
                address_line_one=location.get('addresslineone', ''),
                address_line_two=location.get('addresslinetwo', ''),
                city=location.get('city', ''),
                state=location.get('state', ''),
                country_code=location.get('country_code', ''),
                postal_code=location.get('postal_code', ''))

            locations.append(new_location)

        contact.locations.add(*locations)

        records = []
        for record in contact_json.get('records', []):
            records.append(record_from_json(record, contact, user))

        record_tags = []
        for tag in contact_json.get('tags', []):
            new_tag, _ = Tag.objects.get_or_create(
                company=partner.owner,
                name=tag['name'])

            record_tags.append(new_tag)

    return contact


def partner_from_json(partner_json, company, user, source):
    overwrite_partner = partner_json['overwrite']

    if partner_json['maptoid']:
        partner = Partner.objects.get(pk=partner_json['maptoid'])
        created = False
    else:
        partner, created = Partner.objects.get_or_create(
            owner=company, name=partner_json['name'])

    if created or overwrite_partner:
        partner.data_source = partner_json.get('datasource', source)
        partner.uri = partner_json.get('uri', '')
        partner.last_action_time = partner_json.get('modified', NOW)
        partner.save()

        partner_tags = []
        for tag in partner_json.get('tags', []):
            new_tag, _ = Tag.objects.get_or_create(
                company=partner.owner,
                name=tag['name'])

            partner_tags.append(new_tag)

        partner.tags.add(*partner_tags)

        for contact in partner_json['contacts']:
            contact_from_json(contact, partner, overwrite_partner, user)

    return partner


def set_primary_contact(partner, partner_json):
    if 'primarycontact' in partner_json:
        partner.primary_contact = Contact.objects.get(
            partner=partner, name=partner_json['primarycontact'])

        partner.save()

    return partner

def record_from_json(record_json, contact, user):
    if 'createdby' in record_json:
        created_by = User.objects.get(email=record_json['createdby'])
    else:
        created_by = user

    record = ContactRecord.objects.create(
        created_on=record_json.get('creatdon', NOW),
        created_by=created_by,
        contact=contact,
        partner=contact.partner,
        contact_type=record_json['contacttype'],
        contact_email=record_json.get('contactemail', ''),
        subject=record_json.get('subject', ''),
        date_time=record_json.get('datetime', NOW),
        last_action_time=record_json.get('modified', NOW))

    return record



# TODO: failover for when atomic doesn't do its thing - write the ids to file
class Command(BaseCommand):
    help = "Import Partners, Contacts, and ContactRecords from a JSON files."

    def handle(self, *args, **options):
        for filename in filter(os.path.isfile, args):
            with open(filename) as json_file:
                data = json.load(json_file).get('import')

            partners = []
            with transaction.atomic():
                user = User.objects.get(email=data['importinguser'])
                company = Company.objects.get(pk=data['owner'])
                source = data['source']

                for partner_json in data['partners']:
                    partner = partner_from_json(
                        partner_json, company, user, source)

                    partner.save()
                    partners.append(partner)

                # we are just testing for the moment
                #raise IntegrityError("Just testing...")

            with open("results.mysql", "w") as sqlfile:
                partner_ids = [p.pk for p in partners]
                sqlfile.write(
                    str(Partner.objects.filter(pk__in=partner_ids).query))
                sqlfile.write("\n;\n")
                sqlfile.write(
                    str(Contact.objects.filter(
                        partner__in=partners).query))
                sqlfile.write("\n;\n")
                sqlfile.write(
                    str(ContactRecord.objects.filter(
                        partner__in=partners).query))
                sqlfile.write("\n;\n")

