from myreports.datasources.contacts import ContactsDataSource
from myreports.datasources.partners import PartnersDataSource
from myreports.datasources.comm_records import CommRecordsDataSource
from myreports.datasources.util import DataSourceJsonDriver


ds_json_drivers = {
    'contacts': DataSourceJsonDriver(ContactsDataSource()),
    'partners': DataSourceJsonDriver(PartnersDataSource()),
    'comm_records':  DataSourceJsonDriver(CommRecordsDataSource()),
}
