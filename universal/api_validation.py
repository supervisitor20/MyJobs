import json

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

class MultiFormApiValidator(object):
    """
    Record request errors for communication to a client in UI that contains
    multiple forms/models.

    Intended for use in Django views. Construct this object, record errors
    found, then return the error response if there are errors.

    """

    def __init__(self, forms=[]):
        self.api_errors = []
        self.form_errors = {form:[] for form in forms}

    def api_error(self, error_text):
        """
        Note an error that occurred but is not specific to any particular
        form.

        :param error_text: text describing the error

        """
        self.api_errors.append(error_text)

    def form_error(self, form, error_text):
        """
        Note a form error that is not specific to a particular field.

        :param form: form on which the error occurred
        :param error_text: text describing the error

        """
        self.form_errors[form].append({'message': error_text})

    def form_field_error(self, form, field, error_text):
        """
        Note a form error which is specific to a particular field.

        :param form: form on which the error occurred
        :param field: field on which the error occurred
        :param error_text: text describing the error

        """
        self.form_errors[form].append({'field': field, 'message': error_text})

    def count_errors(self):
        """
        How many errors have been reported so far?

        :return: number of errors
        """
        form_errors = sum((len(form) for form in self.form_errors.itervalues()))
        return form_errors + len(self.api_errors)

    def has_errors(self):
        """
        Have any errors been recorded in any model so far?

        :return: true/false if errors exist

        """
        return bool(self.count_errors())

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
                            content=json.dumps({'api_errors':self.api_errors,
                                                'form_errors':self.form_errors}
                                               ))
        resp.status_code = 400
        resp.reason_phrase = 'bad request'
        return resp
