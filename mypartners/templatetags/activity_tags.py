import bleach
import re

from django.template import Library
from django.utils.safestring import mark_safe

from mypartners.helpers import get_attachment_link
from mypartners.models import ACTIVITY_TYPES

register = Library()


@register.simple_tag
def attachment_link(attachment, partner):
    name = attachment.attachment.name.split("/")[-1]
    return get_attachment_link(partner.id, attachment.id, name)


@register.simple_tag
def get_action_type(activity):
    action_type = ACTIVITY_TYPES[activity.action_flag]
    return action_type.title()


@register.filter
def bleach_clean(string):
    """
    Cleans a string of all html tags, attributes, and sytles except those
    specified and marks it safe to display as html.

    """
    # Rough estimation of if it's html
    if re.search('<br>', string) is None:
        string = string.replace('\n', '<br>')
    tags = ['br', 'a']
    attrs = {
        'a': ['href'],
    }
    style = []

    # strip = True means the tags are stripped from the result
    # rather than being included as escaped characters.
    return mark_safe(bleach.clean(string, tags, attrs, style, strip=True))


@register.filter
def strip_tags(string):
    # Rough estimation of if it's html
    if re.search('<br>', string) is None:
        string = string.replace('\n', '<br>')
    return mark_safe(bleach.clean(string, strip=True))