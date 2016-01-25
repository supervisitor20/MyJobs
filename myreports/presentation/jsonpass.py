import json
from myreports.presentation.base import Presentation


class JsonPass(Presentation):
    """Write report data as a single json file.

    Useful as a rough passthrough for testing.
    """
    def content_type(self):
        return 'application/json'

    def filename_extension(self):
        return 'json'

    def write_presentation(self, values, records, output):
        output.write(json.dumps({
            'values': values,
            'records': records,
        }))
