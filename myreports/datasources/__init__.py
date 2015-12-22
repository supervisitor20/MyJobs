from myreports.datasources.contacts import (
    ContactsDataSourceJsonDriver, ContactsDataSource)


def get_datasource_json_driver(datasource_name):
    if datasource_name == 'contacts':
        return ContactsDataSourceJsonDriver(ContactsDataSource())
