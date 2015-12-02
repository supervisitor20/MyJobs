from datetime import datetime, timedelta
from StringIO import StringIO

import requests
from urllib2 import HTTPError


def return_file(time_=None):
    """
    Wrapper for url translation; Allows us to override the published date of
    mocked jobs.

    Inputs:
    :time_: DateTime that all jobs should be created on
    """
    def _inner(url, *args, **kwargs):
        """
        Translate a url into a known local file. Reduces the time that tests
        take to complete if they do network access. Replaces `urllib.urlopen`

        Inputs:
        :url: URL to be retrieved
        :args: Ignored
        :kwargs: Ignored

        Outputs:
        :file: File-like object
        """
        feed = False
        if '404.com' in url:
            raise HTTPError(url=None, code=404, msg=None, hdrs=None, fp=None)
        elif 'feed/rss' in url:
            file_ = 'rss.rss'
            feed = True
        elif 'feed/json' in url:
            file_ = 'json.json'
            feed = True
        elif 'mcdonalds/careers/' in url or \
                url.endswith('?location=chicago&q=nurse'):
            file_ = 'careers.html'
        elif any(domain+path in url
                 for domain in ['www.my.jobs', 'www.jobs.jobs']
                 for path in ['/search', '/jobs']):
            file_ = 'jobs.html'
        else:
            return StringIO(requests.get(url).text)

        target = 'mysearches/tests/local/'
        target += file_

        def apply_string_format(dict_):
            contents = open(target).read() % dict_
            return StringIO(contents)

        if feed:
            date_dict = {'old_date': datetime.strftime(datetime.now() -
                                                       timedelta(days=60),
                                                       '%c')}
            if time_ is not None:
                date_dict['date'] = time_
            else:
                date_dict['date'] = datetime.strftime(datetime.now(),
                                                      '%c -0300')
            stream = apply_string_format(date_dict)
        elif file_ == 'jobs.html':
            feed_qs = {'qs': ''}
            qs = url.split('?')
            if len(qs) > 1:
                feed_qs['qs'] = '?' + qs[1]

            stream = apply_string_format(feed_qs)
        else:
            stream = open(target)

        return stream
    return _inner
