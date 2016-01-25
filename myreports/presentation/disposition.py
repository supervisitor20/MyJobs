import re


filename_bad_chars = re.compile(r'\W')


def get_content_disposition(report_name, extension):
    filename = filename_bad_chars.sub('_', report_name)
    return 'attachment; filename=%s.%s' % (filename, extension)
