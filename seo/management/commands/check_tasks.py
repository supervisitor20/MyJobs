from django.core.management.base import BaseCommand 
import json
from django.conf import settings
import requests
from pysolr import Solr
from datetime import datetime, timedelta
from django.core.mail import send_mail



class Command(BaseCommand):
    help = "Check if Solr has seen updates while tasks are in the queue."
    
    port = "15672"
    endpoints = ["solr/", "/api/queues/dseo-vhost/priority/"]
    msg_cutoff = 0
    solr_cuttoff = 0
    look_behind = timedelta(hours=1)
    

    def handle(self, port="15672", queues="solr,priority", *args, **options):
        # Determine the number of tasks still in Rabbit 
        msg_count = 0
        for queue in queues.split(','):
            # Get the queue data from the rabbit Management API
            uri = "http://%(broker)s:%(port)s/api/queues/dseo-vhost/%(queue)s" % {'broker': settings.BROKER_HOST,
                                                                                  'port': port,
                                                                                  'queue': queue}
            resp = requests.get(uri, auth=(settings.BROKER_USER, settings.BROKER_PASSWORD))
            data = json.loads(resp.content)
            msg_count += data["messages_ready"]
            msg_count += data["messages_unacknowledged"]
        
        # If we find that having a couple long running messages can lead to false positives, 
        # we can change the cutoff here.
        if msg_count <= self.msg_cutoff:
            print "No messages in the queue(s), do not raise an alert."
            return
        
        # Determine the number of recently updated jobs in solr.
        conn = Solr(settings.HAYSTACK_CONNECTIONS['default']['URL'])
        start_date = datetime.now() - self.look_behind
        solr_count = conn.search("date_added:[%s TO NOW]" % (start_date.iso_format() + "Z")).hits
        
        if solr_count <= self.solr_cutoff:
            msg = "Found %s messages in rabbit, but saw %s updated job in the last hour.  Perhaps the workers are not responding?" % (msg_count, solr_count)
            send_mail("Rabbit & Solr Monitoring",
                      msg, 
                      "monitoring@apps.directemployers.org", 
                      "matt@apps.directemployers.org")