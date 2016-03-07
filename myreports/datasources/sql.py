count_comm_rec_per_month_per_partner_sql = '''
select
    partner_table.id as partner_id,
    extract(year from comm_rec_table.date_time) as year,
    extract(month from comm_rec_table.date_time) as month,
    count(comm_rec_table.id) as comm_rec_count
from
    mypartners_partner partner_table
    join
    mypartners_contact contact_table
    on partner_table.id = contact_table.partner_id
    join
    mypartners_contactrecord comm_rec_table
    on contact_table.id = comm_rec_table.contact_id
where
    partner_table.id in %(partner_list)s
group by partner_table.id, year, month
'''
