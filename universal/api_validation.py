import json

from django.http import HttpResponse


class ApiValidator(object):
    '''Record request errors for communication to a client in a standard form.

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
    '''

    def __init__(self):
        self.errors = []

    def note_error(self, error_text):
        '''Note an error that is not specific to a particular field.'''
        self.errors.append({'message': error_text})

    def note_field_error(self, field, error_text):
        '''Note an error which is specific to a particular field.'''
        self.errors.append({'field': field, 'message': error_text})

    def has_errors(self):
        '''Have any errors been recorded so far?'''
        return bool(self.errors)

    def build_error_response(self):
        '''Send an error response to a client.

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
        '''
        resp = HttpResponse(content_type='application/json',
                            content=json.dumps(self.errors))
        resp.status_code = 400
        resp.reason_phrase = 'bad request'
        return resp

    def build_document(self):
        '''Build just the data structures for the error response.'''
        return list(self.errors)
