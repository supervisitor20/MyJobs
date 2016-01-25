# -*- coding: utf-8 -*-
import datetime
from os import path

import lxml
import pytz

import import_jobs
from seo.tests.factories import BusinessUnitFactory
from seo.tests.setup import DirectSEOBase
import transform


utc = pytz.UTC


class HrXmlToJsonTest(DirectSEOBase):
    fixtures = ['import_jobs_testdata.json', 'countries.json']

    def setUp(self):
        super(HrXmlToJsonTest, self).setUp()
        self.HRXML_DOC = path.join(path.dirname(__file__), 'data/hr_xml.xml')
        self.bu = BusinessUnitFactory()
        import_jobs.add_company(self.bu)

    def test_dates_have_timezones(self):
        """Assert that dates on imports can be resolved to specifc utc times"""

        with open(self.HRXML_DOC) as f:
            etree = lxml.etree.fromstring(f.read())

        result = transform.hr_xml_to_json(etree, self.bu)

        # Check date_updated
        date_updated = result['date_updated']

        # Assert it has a timezone
        self.assertIsNotNone(date_updated.tzinfo,
                             msg="The date_updated should have a "\
                                 "timezone associated with it.")

        # Assert the datetime is correct when converted to UTC.
        actual_utc = date_updated.astimezone(pytz.UTC)
        expected = datetime.datetime(2015, 12, 23, 06, 48, 11, 533000, pytz.UTC)
        self.assertEqual(actual_utc, expected,
            msg="date_updated is '%s', it should equal '%s'" % (
                date_updated.astimezone(pytz.UTC),
                expected.isoformat()))

        # Check date_created
        date_new = result['date_new']

        # Assert it has a timezone
        self.assertIsNotNone(date_new.tzinfo,
                             msg="The date_new should have a "\
                                 "timezone associated with it.")

        # Assert the datetime is correct when converted to UTC.
        actual_utc = date_new.astimezone(pytz.UTC)
        expected = datetime.datetime(2015, 11, 01, 05, 48, 11, 0, pytz.UTC)
        self.assertEqual(actual_utc, expected,
            msg="date_new is '%s', it should equal '%s'" % (
                date_new.astimezone(pytz.UTC),
                expected.isoformat()))
