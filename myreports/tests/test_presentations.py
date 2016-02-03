from zipfile import ZipFile
from cStringIO import StringIO
from unittest import TestCase
from defusedxml.ElementTree import fromstring
from myreports.presentation.disposition import get_content_disposition
from myreports.presentation.csv import Csv
from myreports.presentation.xlsx import Xlsx


class TestDisposition(TestCase):
    def test_content_disposition_filename(self):
        """Filenames in disposition should be cleaned of odd characters."""
        self.assert_filename("abc", "abc")
        self.assert_filename("a_bc", "a bc")
        self.assert_filename("a_bc", "a\tbc")
        self.assert_filename("a_bc", u"a\u2019bc")

    def assert_filename(self, expected_filename, report_name):
        expected_disposition = (
            "attachment; filename=%s.zzz" %
            expected_filename)
        actual = get_content_disposition(report_name, 'zzz')
        self.assertEqual(expected_disposition, actual)


class TestCsv(TestCase):
    csv = Csv()

    def test_presentation(self):
        """Happy path, puts data in csv columns, etc."""
        expected = "A,B\r\n1,b\r\n2,bb\r"
        values = ['A', 'B']
        records = [
            {'A': 1, 'B': 'b'},
            {'A': 2, 'B': 'bb'},
        ]
        self.assert_content(expected, values, records)

    def test_presentation_unicode(self):
        """Run a unicode character through the presentation."""
        expected = "A\r\naa\xe2\x80\x99zz\r\n"
        values = ['A']
        records = [{'A': u'aa\u2019zz'}]
        self.assert_content(expected, values, records)

    def assert_content(self, expected, values, records):
        output = StringIO()
        self.csv.write_presentation(values, records, output)
        self.assertEqual(expected, output.getvalue())


class TestXlsx(TestCase):
    xlsx = Xlsx()
    ns = {
        'ssml': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    }

    def test_presentation(self):
        """Make sure the data can be found in the Excel spreadsheet."""
        output = StringIO()
        values = ['A', 'B']
        records = [
            {'A': 1, 'B': 'b'},
            {'A': 2, 'B': 'bb'},
        ]
        self.xlsx.write_presentation(values, records, output)
        sheet_entry = 'xl/worksheets/sheet1.xml'
        sheet_content = ZipFile(output).open(sheet_entry).read()
        root = fromstring(sheet_content)
        cells = root.findall('.//ssml:t', self.ns)
        values = [e.text for e in cells]
        expected_values = ['A', 'B', '1', 'b', '2', 'bb']
        self.assertEqual(expected_values, values)
