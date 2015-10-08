import csv
from datetime import datetime
from time import time

from mypartners.models import ContactRecord
from django.contrib.contenttypes.models import ContentType
from django.db import connection
from django.core.exceptions import ObjectDoesNotExist


def fix_dates():
    time_start = time()
    count_iterations = 0
    count_cd_gt_lm = 0
    count_cd_gt_at = 0
    count_lm_lt_at = 0
    content_type_of_class = ContentType.objects.get_for_model(ContactRecord)
    cursor = connection.cursor()
    cursor.execute('select max(action_time), min(action_time),'
                   ' object_id, content_type_id from mypartners_contactlogentry'
                   ' where content_type_id = "%s" group by object_id;' % content_type_of_class.pk)
    all_logs = cursor.fetchall()
    with open('created_on_objects_to_convert.csv', 'w') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['ContRecord ID', 'CreateDate Before', 'CreateDate After', 'ModDate Before',
                             'ModDate After', 'Change Notes'])
        for log in all_logs:
            count_iterations += 1
            try:
                contact_record = ContactRecord.objects.get(pk=log[2])
            except ObjectDoesNotExist:
                continue

            # Heartbeat every 1000 iterations with percent complete
            if count_iterations % 1000 == 0:
                print 'Time: %s -  Complete: %s %' % (datetime.now(), round(count_iterations / len(all_logs) * 100, 2))

            modified = False
            # create csv array with placeholder data for "after" columns
            csv_line = [contact_record.pk, contact_record.created_on,
                        contact_record.created_on, contact_record.last_modified,
                        contact_record.last_modified]
            change_notes = []

            # check if created_on is greater than last_modified, if so, assign it
            if not (contact_record.last_modified and contact_record.last_modified >= contact_record.created_on):
                modified = True
                count_cd_gt_lm += 1
                contact_record.last_modified = contact_record.created_on
                csv_line[4] = contact_record.created_on
                change_notes.append('CREATE->LAST_MOD')

            # check if most recent log shows a more recent date than last_modified, if so, assign it
            if log[0] > contact_record.last_modified:
                modified = True
                count_lm_lt_at += 1
                contact_record.last_modified = log[0]
                csv_line[4] = log[0]
                change_notes.append('LOG->LAST_MOD')

            # check if most distant log shows a more distant date that created_on, if so, assign it
            if log[1] < contact_record.created_on:
                modified = True
                count_cd_gt_at += 1
                contact_record.created_on = log[1]
                csv_line[2] = log[1]
                change_notes.append('LOG->CREATED')

            # merge all change notes into a readable string for the CSV
            if change_notes:
                csv_line.append(' '.join(change_notes))

            # if any modifications made (or detected to be made), report it in CSV
            if modified:
                csv_writer.writerow(csv_line)
                # contact_record.save()

        csv_writer.writerow(['Count created date > last modified: ', count_cd_gt_lm])
        csv_writer.writerow(['Count action_time > last_modified: ', count_lm_lt_at])
        csv_writer.writerow(['Count created date > action time: ', count_cd_gt_at])
        csv_writer.writerow(['Total run time (minutes): ', round((time() - time_start) / 60, 2)])
    print 'Count created date > last modified: ', count_cd_gt_lm
    print 'Count action_time > last_modified: ', count_lm_lt_at
    print 'Count created date > action time: ', count_cd_gt_at
    print 'Total run time: ', (time() - time_start) / 60
