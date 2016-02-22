import unicodecsv
from myreports.presentation.base import Presentation


class Csv(Presentation):
    """Write csv based presentation formats."""
    content_type = 'text/csv'

    filename_extension = 'csv'

    def write_presentation(self, values, records, output):
        csvwriter = unicodecsv.writer(output, encoding='utf-8')
        csvwriter.writerow(values)
        for record in records:
            csvwriter.writerow(unicode(record[v]) for v in values)
