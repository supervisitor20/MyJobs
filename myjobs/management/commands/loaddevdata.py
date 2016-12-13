from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from myjobs.models import User
from seo.models import Configuration, SeoSite


def get_object(model, **kwargs):
    """
    Tries to get an object from the database. If the object doesn't exist,
    returns a new, unsaved, instance of that object.

    :param model: The model of the object being requested from the database.
    :param kwargs: Any kwargs that should be used as lookup for
                   the model instance.

    :return: The object, if it exists, otherwise a new, unsaved instance
             of the requested model with the kwargs used to look up the object
             set.
    """
    try:
        return model.objects.get(**kwargs), False
    except model.DoesNotExist:
        return model(**kwargs), True
    # Note: model.MultipleObjectsReturned is explicitly not handled here,
    #       so you should probably make sure that doesn't happen if you're
    #       using this.


def update_or_create(model, defaults=None, **kwargs):
    """
    If the object exists in the database, retrieves and updates the existing
    instance with the dict passed in defaults. Otherwise creates a new instance
    with the specified kwargs.

    This should be updated to use model.objects.update_or_create()
    when we get to post-Django 1.7.

    :param defaults: Any fields and values that should be updated, but
                     should not be used as query terms.
    :param kwargs: Any fields and values that should be used to query for an
                   existing object.
    :return: The object instance, and a boolean for whether or not it was
             created.
    """
    defaults = defaults or {}

    instance, created = get_object(model, **kwargs)

    for key, value in defaults.items():
        setattr(instance, key, value)

    instance.save()

    return instance, created


class Command(BaseCommand):
    def handle(self, *args, **options):
        """
        Create default development data to make running the app without
        access to real data easier.

        Note: defaults is used because, while it makes things slightly more
              annoying now, with the switch to Django 1.9
              update_or_create() can be used, which will make this code
              easier to follow.

        """
        # Generic base user.
        defaults = {
            'email': 'dev@apps.directemployers.org',
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
        }
        user, _ = update_or_create(User, pk=1, defaults=defaults)
        user.set_password('password')
        user.save()

        # A default SEO group, so Business Units, Faces and all those things
        # can be easily accessible.
        defaults = {'name': 'Default SEO Group'}
        group, _ = update_or_create(Group, pk=1, defaults=defaults)

        # Clone of www.my.jobs.
        defaults = {
            'domain': 'www.my.jobs',
            'group': group,
            'site_title': 'Dev My.jobs',
            'site_heading': 'Dev My.jobs',
            'site_description': 'The Right Place for Developers.',
        }
        site, _ = update_or_create(SeoSite, pk=1, defaults=defaults)

        defaults = {
            'title': 'My jobs - development home page',
            'status': Configuration.STATUS_PRODUCTION,
            'browse_moc_show': True,
            'home_page_template': 'home_page/home_page_listing.html',
        }
        config, _ = update_or_create(Configuration, pk=1, defaults=defaults)
        site.configurations.add(config)

        # A fake company site.
        defaults = {
            'domain': 'directemployers.jobs',
            'group': group,
            'site_title': 'Dev Jobs for Direct Employers',
            'site_heading': 'Dev Jobs for Direct Employers',
            'site_description': 'The Right Place for Development Jobs.',
        }
        site, _ = update_or_create(SeoSite, pk=2, defaults=defaults)

        defaults = {
            'title': 'Direct Employers Jobs - development home page',
            'status': Configuration.STATUS_PRODUCTION,
            'browse_moc_show': True,
            'home_page_template': 'home_page/home_page_billboard.html',
        }
        config, _ = update_or_create(Configuration, pk=2, defaults=defaults)
        site.configurations.add(config)

        # A fake regional site.
        defaults = {
            'domain': 'indianapolis.jobs',
            'group': group,
            'site_title': 'Dev My.jobs',
            'site_heading': 'Dev My.jobs',
            'site_description': 'The Right Place for Developers.',
        }
        site, _ = update_or_create(SeoSite, pk=3, defaults=defaults)

        defaults = {
            'title': 'My jobs - development home page',
            'status': Configuration.STATUS_PRODUCTION,
            'browse_moc_show': True,
            'home_page_template': 'home_page/home_page_listing.html',
        }
        config, _ = update_or_create(Configuration, pk=3, defaults=defaults)
        site.configurations.add(config)
