import json

from myjobs.tests.setup import MyJobsBase
import myreports.models as myreports_models

from django.core.urlresolvers import reverse

from analytics.api import (get_available_analytics, get_report_info,
                           dynamic_chart)


class TestStartingPointApi(MyJobsBase):
    def setUp(self):
        super(TestStartingPointApi, self).setUp()
        self.maxDiff = 10000
        self.role.add_activity("view analytics")
        self.rit_analytics = myreports_models.ReportingType.objects.create(
            reporting_type="web-analytics",
            description="Web Analytics",
            is_active=True)

        self.rt_job_titles = myreports_models.ReportType.objects.create(
            report_type="job-titles",
            description="Job Titles",
            is_active=True)
        self.rt_job_found_on = myreports_models.ReportType.objects.create(
            report_type="job-found-on",
            description="Site Found On",
            is_active=True)
        self.rt_job_locations = myreports_models.ReportType.objects.create(
            report_type="job-locations",
            description="Job Locations",
            is_active=True)

        myreports_models.ReportingTypeReportTypes.objects.create(
            reporting_type=self.rit_analytics,
            report_type=self.rt_job_titles,
            is_active=True)
        myreports_models.ReportingTypeReportTypes.objects.create(
            reporting_type=self.rit_analytics,
            report_type=self.rt_job_found_on,
            is_active=True)
        myreports_models.ReportingTypeReportTypes.objects.create(
            reporting_type=self.rit_analytics,
            report_type=self.rt_job_locations,
            is_active=True)

        unagg = myreports_models.DataType.objects.create(
                data_type="Unaggregated")

        self.config_job_titles = myreports_models.Configuration.objects.create(
            name="Job Titles",
            is_active=True)
        self.config_found_on = myreports_models.Configuration.objects.create(
            name="Found On",
            is_active=True)
        self.config_job_locations = (
            myreports_models.Configuration.objects.create(
                name="Job Locations",
                is_active=True))

        self.rtdt_job_titles = (
            myreports_models.ReportTypeDataTypes.objects.create(
                report_type=self.rt_job_titles,
                data_type=unagg,
                is_active=True,
                configuration=self.config_job_titles))
        self.rtdt_job_found_on = (
            myreports_models.ReportTypeDataTypes.objects.create(
                report_type=self.rt_job_found_on,
                data_type=unagg,
                is_active=True,
                configuration=self.config_found_on))
        self.rtdt_job_locations = (
            myreports_models.ReportTypeDataTypes.objects.create(
                report_type=self.rt_job_locations,
                data_type=unagg,
                is_active=True,
                configuration=self.config_job_locations))

        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=1,
            column_name="title",
            filter_interface_type='string',
            filter_interface_display='Job Title',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=2,
            column_name="job_guid",
            filter_interface_type='string',
            filter_interface_display='Job Id',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=3,
            column_name="country",
            filter_interface_type='map:world',
            filter_interface_display='Country',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=4,
            column_name="state",
            filter_interface_type='map:nation',
            filter_interface_display='State',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=5,
            column_name="city",
            filter_interface_type='map:state',
            filter_interface_display='City',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_titles,
            order=6,
            column_name="found_on",
            filter_interface_type='string',
            filter_interface_display='Found on',
            multi_value_expansion=0,
            is_active=True)

        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=1,
            column_name="found_on",
            filter_interface_type='string',
            filter_interface_display='Found On',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=2,
            column_name="title",
            filter_interface_type='string',
            filter_interface_display='Job Title',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=3,
            column_name="job_guid",
            filter_interface_type='string',
            filter_interface_display='Job Id',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=4,
            column_name="country",
            filter_interface_type='map:world',
            filter_interface_display='Country',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=4,
            column_name="state",
            filter_interface_type='map:nation',
            filter_interface_display='State',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_found_on,
            order=6,
            column_name="city",
            filter_interface_type='map:state',
            filter_interface_display='City',
            multi_value_expansion=0,
            is_active=True)

        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=1,
            column_name="country",
            filter_interface_type='map:world',
            filter_interface_display='Country',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=2,
            column_name="state",
            filter_interface_type='map:nation',
            filter_interface_display='State',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=3,
            column_name="city",
            filter_interface_type='map:state',
            filter_interface_display='City',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=4,
            column_name="found_on",
            filter_interface_type='string',
            filter_interface_display='Found On',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=5,
            column_name="title",
            filter_interface_type='string',
            filter_interface_display='Job Title',
            multi_value_expansion=0,
            is_active=True)
        myreports_models.ConfigurationColumn.objects.create(
            configuration=self.config_job_locations,
            order=6,
            column_name="job_guid",
            filter_interface_type='string',
            filter_interface_display='Job Id',
            multi_value_expansion=0,
            is_active=True)

    def test_available(self):
        response = self.client.get(reverse(get_available_analytics))
        result = json.loads(response.content)
        expected = {
            'reports': [
                {
                    'value': 'job-locations',
                    'display': 'Job Locations',
                },
                {
                    'value': 'job-titles',
                    'display': 'Job Titles',
                },
                {
                    'value': 'job-found-on',
                    'display': 'Site Found On',
                },
            ],
        }
        self.assertEqual(expected, result)

    def test_report_info(self):
        response = self.client.get(
            reverse(get_report_info),
            {'analytics_report_id': 'job-locations'})
        result = json.loads(response.content)
        expected = {
            'dimensions': [
                {
                    'value': 'country',
                    'display': 'Country',
                    'interface_type': 'map:world',
                },
                {
                    'value': 'state',
                    'display': 'State',
                    'interface_type': 'map:nation',
                },
                {
                    'value': 'city',
                    'display': 'City',
                    'interface_type': 'map:state',
                },
                {
                    'value': 'found_on',
                    'display': 'Found On',
                    'interface_type': 'string',
                },
                {
                    'value': 'title',
                    'display': 'Job Title',
                    'interface_type': 'string',
                },
                {
                    'value': 'job_guid',
                    'display': 'Job Id',
                    'interface_type': 'string',
                },
            ]
        }
        self.assertEqual(expected, result)

    def test_report_info_no_id(self):
        response = self.client.get(reverse(get_report_info))
        self.assertEqual(400, response.status_code)
        result = json.loads(response.content)
        fields = [i['field'] for i in result]
        self.assertIn('analytics_report_id', fields)

    def test_report_info_bad_id(self):
        response = self.client.get(
            reverse(get_report_info),
            {'analytics_report_id': 'zzzzz'})
        self.assertEqual(400, response.status_code)
        result = json.loads(response.content)
        fields = [i['field'] for i in result]
        self.assertIn('analytics_report_id', fields)

    def test_valid_dynamic_charts_request(self):
        request_data = {"date_start": "10/18/2012 00:00:00",
                        "date_end": "10/18/2012 00:00:00",
                        "active_filters": [],
                        "report": "job-found-on",
                        "group_overwrite": "found_on"}
        response = self.client.post(reverse(dynamic_chart),
                                    {"request": json.dumps(request_data)})

        result = json.loads(response.content)
        self.assertEqual(200, response.status_code)
        self.assertTrue('rows' in result)

    def test_dynamic_charts_report_info_missing_date(self):
        request_data = {"date_end": "11/28/2016 00:00:00"}
        response = self.client.post(reverse(dynamic_chart),
                                    {"request": json.dumps(request_data)})
        self.assertEqual(400, response.status_code)
        result = json.loads(response.content)
        fields = [i['field'] for i in result]
        self.assertIn('date_start', fields)

    def test_dynamic_charts_report_info_no_data(self):
        request_data = {}
        response = self.client.post(reverse(dynamic_chart),
                                    {"request": json.dumps(request_data)})
        result = json.loads(response.content)
        self.assertEqual(400, response.status_code)
        message = result[0]['message']
        self.assertEqual(message, 'No data provided.')