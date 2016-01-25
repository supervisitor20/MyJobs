import re


filename_bad_chars = re.compile(r'\W')


def get_content_disposition(report_name, extension):
    """Build the contents of a Content-Disposition header.

    Takes care of removing spaces and other problematic characteres from
    filenames.

    report_name - name of the report. Can contain arbitrary characters.
    extension - file extension for the report filename.
    """
    filename = filename_bad_chars.sub('_', report_name)
    return 'attachment; filename=%s.%s' % (filename, extension)
