import json
from myreports.presentation.base import Presentation


class JsonPass(Presentation):
    def content_type(self):
        return 'application/json'

    def filename_extension(self):
        return 'json'

    def write_presentation(self, values, records, output):
        output.write(json.dumps({
            'values': values,
            'records': records,
        }))
