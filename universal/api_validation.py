import json
from copy import deepcopy

from django.http import HttpResponse


class ApiValidator(object):
    """
    Record request errors for communication to a client in a standard form.

    Intended for use in Django views. Construct this object, record errors
    found, then return the error response if there are errors.

    Example:
        def some_api_view(request):
            validator = ApiValidator()
            # take apart request
            name = request.POST.get('name', '')
            if not name:
                # record validation errors as we find them
                validator.note_field_error("name", "Report name must not be empty.")
            ... more validation

            if validator.has_errors():
                # if we found any errors, bail with this error response.
                return validator.build_error_response()

            ... do stuff

    """

    def __init__(self):
        self.errors = []

    def note_error(self, error_text):
        """
        Note an error that is not specific to a particular field.

        """
        self.errors.append({'message': error_text})

    def note_field_error(self, field, error_text):
        """
        Note an error which is specific to a particular field.

        """
        self.errors.append({'field': field, 'message': error_text})

    def count_errors(self):
        """
        How many errors have been reported so far?

        :return: number of errors

        """

        return len(self.errors)

    def has_errors(self):
        """
        Have any errors been recorded so far?

        :return: true/false if errors exist

        """
        return bool(self.errors)

    def build_error_response(self):
        """
        Send an error response to a client.

        Example:
        400 bad request
        ...

        [
            {
                'field': 'name',
                'message': 'Report name cannot be empty.',
            },
            {
                'message': 'Order must be under $300.',
            },
        ]

        """
        resp = HttpResponse(content_type='application/json',
                            content=json.dumps(self.errors))
        resp.status_code = 400
        resp.reason_phrase = 'bad request'
        return resp

    def build_document(self):
        """
        Build just the data structures for the error response.

        """
        return list(self.errors)


class FormsApiValidator(object):
    def __init__(self, input_doc):
        self.input_doc = input_doc
        self.output_doc = deepcopy(input_doc)
        if 'api_errors' not in self.output_doc:
            self.output_doc['api_errors'] = []
        self.has_form_errors = False

    def forms(self):
        return set(self.output_doc['forms'].keys())

    def note_has_form_errors(self):
        self.has_form_errors = True

    def has_errors(self):
        return self.has_form_errors or bool(self.output_doc['api_errors'])

    def note_api_error(self, error):
        self.output_doc['api_errors'].append(error)

    def build_document(self):
        return self.output_doc

    def descend(self, form_path):
        isolated = self.output_doc['forms']
        for segment in form_path:
            isolated = isolated[segment]
        return isolated

    def isolate_validator(self, *form_path):
        isolated = self.descend(form_path)
        return IsolatedFormValidator(isolated, self)

    def iter_validators(self, *form_path):
        iterable = self.descend(form_path)
        for isolated in iterable:
            yield IsolatedFormValidator(isolated, self)

    def build_error_response(self):
        resp = HttpResponse(content_type='application/json',
                            content=json.dumps(self.output_doc))
        resp.status_code = 400
        resp.reason_phrase = 'bad request'
        return resp


def collapse_values(data):
    result = {}
    for (k, v) in data.iteritems():
        if isinstance(v, dict) and 'value' in data[k]:
            result[k] = v['value']
        else:
            result[k] = collapse_values(v)
    return result


class IsolatedFormValidator(object):
    def __init__(self, form_root, parent):
        self.form_root = form_root
        self.parent = parent

    def get_values(self):
        return collapse_values(self.form_root)

    def note_field_error(self, field_name, message):
        self.parent.note_has_form_errors()
        field = self.form_root[field_name]
        if 'errors' not in field:
            field['errors'] = []
        field['errors'].append(message)
