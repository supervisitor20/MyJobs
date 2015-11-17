from datetime import datetime

from unittest import TestCase

from myreports.report_configuration import (
    ReportConfiguration, ColumnConfiguration, FilterInterfaceConfiguration)


class TestReportConfig(TestCase):
    def setUp(self):
        super(TestReportConfig, self).setUp()
        self.contacts_config = ReportConfiguration(
            columns=[
                ColumnConfiguration(
                    column='name',
                    format='text'),
                ColumnConfiguration(
                    column='partner',
                    format='text'),
                ColumnConfiguration(
                    column='email',
                    format='text'),
                ColumnConfiguration(
                    column='phone',
                    format='text'),
                ColumnConfiguration(
                    column='date',
                    format='us_date'),
                ColumnConfiguration(
                    column='notes',
                    format='text'),
                ColumnConfiguration(
                    column='locations',
                    format='city_state_list'),
                ColumnConfiguration(
                    column='tags',
                    format='comma_sep'),
            ],
            filter_interface=[
                FilterInterfaceConfiguration(
                    filters=['date_begin', 'date_end'],
                    type='date_range'),
                FilterInterfaceConfiguration(
                    filter='city',
                    type='search_select'),
                FilterInterfaceConfiguration(
                    filter='state',
                    type='search_select'),
                FilterInterfaceConfiguration(
                    filter='tags',
                    type='search_multiselect'),
                FilterInterfaceConfiguration(
                    filter='partner',
                    type='search_multiselect'),
            ])

        self.test_data = [
            {
                'date': datetime(2015, 10, 3),
                'email': u'john@user.com',
                'locations': [
                    {'city': u'Indianapolis', 'state': u'IN'},
                    {'city': u'Chicago', 'state': u'IL'}
                ],
                'name': u'john adams',
                'notes': u'',
                'partner': u'aaa',
                'phone': u'84104391',
                'tags': [u'east']
            },
            {
                'date': datetime(2015, 9, 30),
                'email': u'sue@user.com',
                'locations': [
                    {'city': u'Los Angeles', 'state': u'CA'},
                ],
                'name': u'Sue Baxter',
                'notes': u'',
                'partner': u'bbb',
                'phone': u'84104391',
                'tags': [u'west']
            }
        ]

    def test_header(self):
        header = self.contacts_config.get_header()
        self.assertEqual([
            'name', 'partner', 'email', 'phone', 'date', 'notes',
            'locations', 'tags'],
            header)

    def test_records(self):
        self.maxDiff = 10000
        rec = self.contacts_config.format_record(self.test_data[0])
        self.assertEqual({
            'name': 'john adams',
            'partner': 'aaa',
            'email': 'john@user.com',
            'phone': '84104391',
            'date': '10/03/2015',
            'notes': '',
            'locations': "Indianapolis, IN, Chicago, IL",
            'tags': 'east',
            }, rec)
        rec = self.contacts_config.format_record(self.test_data[1])
        self.assertEqual({
            'name': 'Sue Baxter',
            'partner': 'bbb',
            'email': 'sue@user.com',
            'phone': '84104391',
            'date': '09/30/2015',
            'notes': '',
            'locations': 'Los Angeles, CA',
            'tags': 'west',
            }, rec)


class TestColumnConfiguration(TestCase):
    def test_trivial(self):
        test_data = {'name': 'asdf'}
        self.assertEqual(
            'asdf',
            ColumnConfiguration(
                column='name',
                format='text').extract_formatted(test_data))

    def test_deep_join(self):
        test_data = {
            'locations': [
                {'city': 'Indy', 'state': 'IN'},
                {'city': 'Chicago', 'state': 'IL'},
            ],
        }
        self.assertEqual(
            'Indy, IN, Chicago, IL',
            ColumnConfiguration(
                column='locations',
                format='city_state_list').extract_formatted(test_data))
