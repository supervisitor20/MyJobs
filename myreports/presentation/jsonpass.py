import json
from myreports.presentation.base import Presentation


class Json(Presentation):
    """Write report data as a single json file.

    Useful as a rough passthrough for testing.
    """
    content_type = 'application/json'

    filename_extension = 'json'

    def write_presentation(self, values, records, output):
        output.write(json.dumps({
            'values': values,
            'records': records,
        }))
