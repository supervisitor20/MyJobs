import urlparse
import urllib
from django.utils.http import urlquote_plus

def replace_or_add_query(url, query, exclusions=None):
    """
    Adds field/value pair to the provided url as a query string if the
    key isn't already in the url, or replaces it otherwise.

    Appends the proper pair separator (?&) based on the input url

    Inputs:
    :url: URL that query string should be appended to
    :query: Query string(s) to add to :url:
    :exclusions: List of keys that should not be copied; common keys
        include 'vs' and 'z'

    Outputs:
    :url: Input url with query string appended
    """
    if not exclusions:
        exclusions = []
    if len(query) > 1 and query[0] in ['?', '&']:
        query = query[1:]
        query = query.encode('utf-8')
        url = url.encode('utf-8')
        url = urlparse.urlparse(url)
        old_query = urlparse.parse_qsl(url.query, keep_blank_values=True)
        old_keys = [q[0] for q in old_query]
        # make a lower-case copy of old_keys so we can do some comparisons
        insensitive_keys = map(str.lower, old_keys)

        new_query = urlparse.parse_qsl(query, keep_blank_values=True)

        # For each source code that we are going to add
        for new_index in range(len(new_query)):
            # Make sure we are not adding a source code that should be excluded
            if new_query[new_index][0] not in exclusions:
                try:
                    # Case-insensitively determine if the new source code
                    # is already applied
                    old_index = insensitive_keys.index(
                        new_query[new_index][0].lower())
                except ValueError:
                    # The current source code is not applied; apply it
                    old_query.append(new_query[new_index])
                else:
                    # The current source code is already applied; replace its
                    # value, keeping the case of the old parameter
                    old_query[old_index] = (old_query[old_index][0],
                                            new_query[new_index][1])

        # parse_qsl unencodes the query that you pass it; Re-encode the query
        # parameters when reconstructing the string.
        old_query = '&'.join(['='.join([urllib.quote(k, safe=','),
                                        urllib.quote(v, safe=',')])
                             for k, v in old_query])
        url = url._replace(query=old_query)
        url = urlparse.urlunparse(url)
    else:
        parts = url.split('#')
        parts[0] += query
        url = '#'.join(parts)
    return url


def quote_string(value):
    """
    Due to differences between VBScript and Python %% encoding, certain
    substitutions must be done manually. These are required in multiple
    circumstances.

    TODO: Do these encoding issues actually harm anything? Can we get away
    with not manually replacing punctuation that is perfectly valid?

    Inputs:
    :value: String to be quoted

    :value: Quoted string
    """
    value = urlquote_plus(value, safe='')
    value = value.replace('.', '%2E')
    value = value.replace('-', '%2D')
    value = value.replace('_', '%5F')
    return value


def sourcecodetag(redirect_obj, manipulation_obj):
    """
    Appends a query parameter to the redirect url
    """
    url = redirect_obj.url
    query = manipulation_obj.value_1
    if query and query.find('=') > 0:
        # At first blush, this appears to be a valid part of a query string.
        # Technically = being the first character would not cause any issues on
        # our side, but that would make for an invalid parameter.
        url = replace_or_add_query(url, query)
    return url


def doubleclickwrap(redirect_obj, manipulation_obj):
    """
    Routes url through doubleclick
    """
    return manipulation_obj.value_1 + redirect_obj.url


def doubleclickunwind(redirect_obj, manipulation_obj):
    """
    Removes doubleclick redirect from url
    """
    url = redirect_obj.url.split('?')
    return url[-1]


def anchorredirectissue(redirect_obj, manipulation_obj):
    """
    Removes anchor and adds to query string

    Needs work - query string value is added elsewhere (where?)
    """
    url = redirect_obj.url.split('#')
    return url[0] + manipulation_obj.value_1


def sourcecodeswitch(redirect_obj, manipulation_obj):
    """
    Switches all occurrences of value_1 with value_2

    Works with more than source codes; Current uses: entire urls,
    portions of urls, and source codes
    """
    return redirect_obj.url.replace(manipulation_obj.value_1,
                                    manipulation_obj.value_2)


def sourcecodeinsertion(redirect_obj, manipulation_obj):
    """
    Inserts value_1 into the url immediately before the anchor
    """
    url = redirect_obj.url.split('#')
    url = ('%s#' % manipulation_obj.value_1).join(url)
    return url


def sourceurlwrap(redirect_obj, manipulation_obj):
    """
    Encodes the url and prepends value_1 onto it
    """
    url = quote_string(redirect_obj.url)
    return manipulation_obj.value_1 + url


def sourceurlwrapappend(redirect_obj, manipulation_obj):
    """
    sourceurlwrap with value_2 appended
    """
    url = sourceurlwrap(redirect_obj, manipulation_obj)
    return url + manipulation_obj.value_2


def sourceurlwrapunencoded(redirect_obj, manipulation_obj, value1=None):
    """
    Prepends value_1 onto the unencoded url
    """
    value1 = value1 or manipulation_obj.value_1
    return value1 + redirect_obj.url


def sourceurlwrapunencodedappend(redirect_obj, manipulation_obj):
    """
    sourceurlwrapunencoded with value_2 appended
    """
    url = sourceurlwrapunencoded(redirect_obj,
                                 manipulation_obj,
                                 manipulation_obj.value_1)
    return url + manipulation_obj.value_2


def urlswap(redirect_obj, manipulation_obj):
    """
    Swaps the url with value_1
    """
    return manipulation_obj.value_1


def fixurl(redirect_obj, manipulation_obj):
    """
    Replaces value 1 with value 2
    """
    url = redirect_obj.url.replace(manipulation_obj.value_1,
                                   manipulation_obj.value_2)
    return url


def amptoamp(redirect_obj, manipulation_obj):
    """
    Replaces the value before the first ampersand with value_1 and the value
    after the second ampersand with value_2
    """
    url = redirect_obj.url.split('&')
    return manipulation_obj.value_1 + url[1] + manipulation_obj.value_2


def switchlastinstance(redirect_obj, manipulation_obj, old=None, new=None):
    """
    Replaces the last instance of one value with another

    If called on its own, replaces value_1 with value_2; otherwise replaces
    old with new
    """
    old = old or manipulation_obj.value_1
    new = new or manipulation_obj.value_2
    return new.join(redirect_obj.url.rsplit(old, 1))


def switchlastthenadd(redirect_obj, manipulation_obj):
    """
    switchlastinstance with value_2 appended

    The old and new values are '!!!!'-delimited and are stored in value_1
    """
    old, new = manipulation_obj.value_1.split('!!!!')
    new_url = switchlastinstance(redirect_obj, manipulation_obj, old, new)
    return new_url + manipulation_obj.value_2


def replace(redirect_obj, manipulation_obj):
    """
    Utility function that is used in the replacethenadd* actions
    """
    old, new = manipulation_obj.value_1.split('!!!!')
    return redirect_obj.url.replace(old, new)


def replacethenadd(redirect_obj, manipulation_obj):
    """
    Replaces all instances of one value with another, then appends value_2

    The values are '!!!!'-delimited and are stored in value_1
    """
    url = replace(redirect_obj, manipulation_obj)
    add = manipulation_obj.value_2
    url = replace_or_add_query(url, add)
    return url


def replacethenaddpre(redirect_obj, manipulation_obj):
    """
    Replaces all instances of one value with another, then prepends value_2

    The values are '!!!!'-delimited and are stored in value_1
    """
    url = replace(redirect_obj, manipulation_obj)
    return manipulation_obj.value_2 + url


def cframe(redirect_obj, manipulation_obj):
    """
    Redirects to the company frame denoted by value_1, appending the job url
    as the url query parameter
    """
    url = quote_string(redirect_obj.url)
    url = '%s?url=%s' % (manipulation_obj.value_1, url)
    return 'http://directemployers.us.jobs/companyframe/' + url
