import unicodecsv
from myreports.presentation.base import Presentation


class Csv(Presentation):
    def content_type(self):
        return 'text/csv'

    def filename_extension(self):
        return 'csv'

    def write_presentation(self, values, records, output):
        csvwriter = unicodecsv.writer(output, encoding='utf-8')
        csvwriter.writerow(values)
        for record in records:
            csvwriter.writerow(unicode(record[v]) for v in values)
