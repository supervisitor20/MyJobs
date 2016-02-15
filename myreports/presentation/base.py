class Presentation(object):
    """Base class for Reporting presentation types.

    Implementations are responsible for selecting the content type and
    filename extension which the user's browser will see at download time,
    as well as writing bytes of the document to an output stream.
    """

    """Content type as seen by the user's browser.

    i.e. 'application/json', 'text/csv', etc.
    """
    content_type = ''

    """Filename extension seen by the user at download time.

    i.e. 'csv', 'xls', etc.
    """
    filename_extension = ''

    def write_presentation(self, values, records, output):
        """Write bytes representing the downloaded artifact.

        values - Ordered list of columns to appear in the download.
            i.e. ['a', 'c', 'b']
        records - List of dicts containing data to appear in the download.
            i.e. [
            {'a': '1', 'b': '2', 'c', '3'},
            {'a': '4', 'b': '5', 'c', '6'},
        ],
        output - has method output.write(bytes) which accepts bytes for
            download

        Example:

            def write_presentation(self, values, records, output):
                output.write('|'.join(values))
                output.write('\\n')
                for record in records:
                    output.write("|".join(record[v] for v in values]))
                    output.write('\\n')
        """
        pass
