from xlsxwriter import Workbook
from myreports.presentation.base import Presentation


class Xlsx(Presentation):
    def content_type(self):
        return (
            'application/vnd.openxmlformats-' +
            'officedocument.spreadsheetml.sheet')

    def filename_extension(self):
        return 'xlsx'

    def write_presentation(self, values, records, output):
        workbook = Workbook(output, {'constant_memory': True})
        worksheet = workbook.add_worksheet()
        for column, value in enumerate(values):
            worksheet.write_string(0, column, value)
        for row, record in enumerate(records):
            value_iterator = enumerate([unicode(record[v]) for v in values])
            for column, text in value_iterator:
                worksheet.write_string(row + 1, column, text)
        workbook.close()
