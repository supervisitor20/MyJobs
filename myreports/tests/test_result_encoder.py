from unittest import TestCase

import json
from datetime import datetime, tzinfo, timedelta

from myreports.result_encoder import (
    report_hook, ReportJsonEncoder, parse_datetime)


class LocalTime(tzinfo):
    def utcoffset(self, dt):
        return timedelta(hours=-5)

    def dst(self, dt):
        return timedelta(hours=1)

    def tzname(self, dt):
        return "Test/Timezone"


class TestResultEncoding(TestCase):
    def test_parse_date_round_trip_no_tz(self):
        input = datetime(2015, 12, 23, tzinfo=None)
        result = parse_datetime(input.isoformat())
        self.assertEqual(input, result)

    def test_parse_date_round_trip_with_tz(self):
        input = datetime(2015, 12, 23, 5, tzinfo=LocalTime())
        result = parse_datetime(input.isoformat())
        self.assertEqual(input, result)

    def test_round_trip_tz(self):
        data = {
            'a': 1,
            'd': datetime(2015, 12, 23),
        }

        encoded = json.dumps(data, cls=ReportJsonEncoder)

        decoded = json.loads(encoded, object_hook=report_hook)

        self.assertEqual(data, decoded)
