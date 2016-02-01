from unittest import TestCase

import json
from datetime import datetime, tzinfo, timedelta, time

from myreports.result_encoder import (
    report_hook, ReportJsonEncoder, parse_datetime, parse_time,
    encode_datetime, encode_time)


class LocalTime(tzinfo):
    def utcoffset(self, dt):
        return timedelta(hours=-5)

    def dst(self, dt):
        return timedelta(hours=1)

    def tzname(self, dt):
        return "Test/Timezone"


class TestResultEncoding(TestCase):
    def test_parse_date_round_trip_no_tz(self):
        """Test that we can make a round trip without a timezone."""
        input = datetime(2015, 12, 23, tzinfo=None)
        result = parse_datetime(encode_datetime(input))
        self.assertEqual(input, result)

    def test_parse_date_round_trip_with_tz(self):
        """Test that we can make a round trip with a timezone."""
        input = datetime(2015, 12, 23, 5, tzinfo=LocalTime())
        result = parse_datetime(encode_datetime(input))
        self.assertEqual(input, result)

    def test_parse_time_round_trip(self):
        """Test that we can make a round trip with a timezone."""
        input = time(1, 2)
        result = parse_time(encode_time(input))
        self.assertEqual(input, result)

    def test_round_trip_tz(self):
        """Test that we can roundtrip complex data with our infrastucture."""

        data = {
            'a': 1,
            'd': datetime(2015, 12, 23),
            't': time(1, 2),
        }

        encoded = json.dumps(data, cls=ReportJsonEncoder)

        decoded = json.loads(encoded, object_hook=report_hook)

        self.assertEqual(data, decoded)
