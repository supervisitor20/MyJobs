import json
import os

from django.core.management.base import BaseCommand
from django.db import transaction

from mypartners.models import *
from seo.models import *

# TODO: failover for when atomic doesn't do its thing - write the ids to file
class Command(BaseCommand):
    help = "Import Partners, Contacts, and ContactRecords from a JSON files."

    def handle(self, *args, **options):
        for filename in filter(os.path.isfile, args):
            with open(filename) as fd:
                data = json.load(fd).get('import')

            with transaction.atomic():
                created_by = User.objects.get(email=data['importinguser'])
                company = Company.objects.get(pk=data['owner'])

                partners = []
                for p in data['partners']:
                    partner = Partner.objects.create(
                        owner=company,
                        name=p['name'],
                        data_source=p['datasource'],
                        uri=p['uri'],
                        last_action_time=p['modified'])

                    for c in p['contacts']:
                        contact = Contact.objects.create(
                            partner=partner,
                            name=c['name'],
                            email=c['email'],
                            phone=c['phone'],
                            notes=c['notes'],
                            last_action_time=c['modified'])

                        locations = []
                        for l in c['locations']:
                            location = Location.objects.create(
                                label=l['label'],
                                address_line_one=l['addresslineone'],
                                address_line_two=l['addresslinetwo'],
                                city=l['city'],
                                state=l['state'],
                                country_code=l['countrycode'],
                                postal_code=l['postalcode'])

                            locations.append(location)

                        contact.locations = locations

                    partner.primary_contact = Contact.objects.get(
                        partner=partner, name=p['primary contact'])
                    partner.save()
                    partners.append(partner)

                print partners
                print len(partners)
                transaction.rollback()
