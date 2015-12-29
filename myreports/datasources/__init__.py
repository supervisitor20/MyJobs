from myreports.datasources.contacts import ContactsDataSource
from myreports.datasources.partners import PartnersDataSource
from myreports.datasources.util import DataSourceJsonDriver


def get_datasource_json_driver(datasource_name):
    if datasource_name == 'contacts':
        return DataSourceJsonDriver(ContactsDataSource())
    elif datasource_name == 'partners':
        return DataSourceJsonDriver(PartnersDataSource())
