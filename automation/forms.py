from django import forms
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from automation.source_codes import (
    add_source_codes, add_destination_manipulations, process_file)
from redirect.models import Redirect

ATS_PARAMETERS = {
    'brassring': 'codes',
    # reenable when we come up with a good way of handling this
    #'icims': ['mode', 'iis', 'iisn'],
    'taleo': 'src',
    'silkroad': 'jobboardid',
    'openhire': 'jobboardid',
    'ultipro': '_jbsrc',
    'apply2jobs': 'sid',
    'applytracking': 's',
    'catsone': 'ref',
    'recruitmentplatform': 'stype',
    'navicus': 'Source'
}


class SourceCodeFileUpload(forms.Form):
    source_code_file = forms.FileField(
        required=True,
        widget=forms.ClearableFileInput(attrs={'accept': '.xls,.xlsx,.csv'}))
    buids = forms.CharField(required=False)
    source_code_parameter = forms.CharField(required=False)

    def clean(self):
        cleaned_data = super(SourceCodeFileUpload, self).clean()
        source_code_file = cleaned_data.get('source_code_file')
        if not source_code_file:
            self._errors['source_code_file'] = ['Source code file required']
            return

        is_excel = not source_code_file.name.endswith('.csv')
        self.cleaned_data['is_excel'] = is_excel

        # Ensures that the buids input is both present and a comma-delimited
        # list of digits
        buids = self.cleaned_data['buids']
        if buids:
            buids = buids.split(',')
            buids = [buid.strip() for buid in buids]
            if not all([buid.isdigit() for buid in buids]):
                self._errors['buids'] = ['Buids provided are not numeric']

        source_code_parameter = cleaned_data['source_code_parameter']
        if is_excel:
            if not buids:
                self._errors['buids'] = [
                    'Buids must be provided on Excel upload']
            # Checks for jobs belonging to the buids provided and
            # auto-determines an acceptable parameter based on the job. If
            # this fails, a parameter must be provided in the form
            test_job = Redirect.objects.filter(
                buid__in=buids, expired_date__isnull=True).first()
            if test_job:
                for url_part, key in ATS_PARAMETERS.items():
                    if url_part in test_job.url:
                        source_code_parameter = key
                        break
            if not source_code_parameter:
                self._errors['source_code_parameter'] = [
                    "Can't guess source code parameters"]
        if self._errors:
            return
        else:
            # TODO: Detect if the file already contains parameters
            cleaned_data['source_codes'] = process_file(
                location=source_code_file, buids=buids,
                source_name=source_code_parameter, add_codes=False)
        return cleaned_data

    def save(self):
        source_code_file = self.cleaned_data['source_code_file']
        # We already read the file once; seek to the beginning so we can read
        # it again.
        source_code_file.seek(0)

        # Save the uploaded file to disk. Saves to settings.MEDIA_ROOT and
        # automatically resolves name conflicts (filename.xlsx becomes
        # filename_1.xlsx).
        default_storage.save(source_code_file.name,
                             ContentFile(source_code_file.read()))
        method = add_source_codes
        if not self.cleaned_data['is_excel']:
            method = add_destination_manipulations
        return method(buids=self.cleaned_data['buids'],
                      codes=self.cleaned_data['source_codes'])
