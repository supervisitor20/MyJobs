from datetime import datetime
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from myjobs.models import AppAccess, Activity, Role, User, update_activities
from seo.models import BusinessUnit, Company, Configuration, SeoSite


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

    Note: defaults is used because, while it makes things slightly more
          annoying now, with the switch to Django 1.9
          model.objects.update_or_create() can be used directly,
          which will make this code easier to follow.


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
    @staticmethod
    def add_base_users():
        """
        Creates a generic admin user, and a couple users for
        PRM/user management/other apps.

        """
        defaults = {
            'email': 'dev@apps.directemployers.org',
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
            'first_name': 'DirectEmployers',
            'last_name': 'Developer',
            'user_guid': 'dev',
        }
        user, _ = update_or_create(User, pk=1, defaults=defaults)
        user.set_password('password')
        user.save()

        defaults = {
            'email': 'lukeskywalker@apps.directemployers.org',
            'is_verified': True,
            'password': user.password,
            'first_name': 'Luke',
            'last_name': 'Skywalker',
            'user_guid': 'lukeskywalker',
        }
        user, _ = update_or_create(User, pk=2, defaults=defaults)

        defaults = {
            'email': 'r2d2@apps.directemployers.org',
            'is_verified': True,
            'password': user.password,
            'first_name': 'R2',
            'last_name': 'D2',
            'user_guid': 'r2d2',
        }
        user, _ = update_or_create(User, pk=3, defaults=defaults)

    def add_base_sites(self):
        """
        Creates a few generic base SeoSite instances:

            Basic clones of www.my.jobs:
                www.my.jobs
                localhost
                127.0.0.1
            A company site:
                directemployers.jobs
            A regional site:
                indianapolis.jobs

        """
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

        defaults['domain'] = 'localhost'
        site, _ = update_or_create(SeoSite, pk=2, defaults=defaults)
        site.configurations.add(config)
        defaults['domain'] = '127.0.0.1'
        site, _ = update_or_create(SeoSite, pk=3, defaults=defaults)
        site.configurations.add(config)

        # A fake company site.
        defaults = {
            'date_crawled': datetime.now(),
            'date_updated': datetime.now(),
        }
        bu, _ = update_or_create(BusinessUnit, pk=1, defaults=defaults)

        defaults = {
            'domain': 'directemployers.jobs',
            'group': group,
            'site_title': 'Dev Jobs for Direct Employers',
            'site_heading': 'Dev Jobs for Direct Employers',
            'site_description': 'The Right Place for Development Jobs.',
        }
        site, _ = update_or_create(SeoSite, pk=4, defaults=defaults)
        site.business_units.add(bu)

        defaults = {
            'title': 'Direct Employers Jobs - development home page',
            'status': Configuration.STATUS_PRODUCTION,
            'browse_moc_show': True,
            'home_page_template': 'home_page/home_page_billboard.html',
        }
        config, _ = update_or_create(Configuration, pk=2, defaults=defaults)
        site.configurations.add(config)

        defaults = {
            'name': 'DirectEmployers',
            'company_slug': 'directemployers',
            'member': True,
            'digital_strategies_customer': True,
        }
        company, _ = update_or_create(Company, pk=1, defaults=defaults)
        company.job_source_ids.add(bu)
        self.add_roles(company)

        # A fake regional site.
        defaults = {
            'domain': 'indianapolis.jobs',
            'group': group,
            'site_title': 'Dev My.jobs',
            'site_heading': 'Dev My.jobs',
            'site_description': 'The Right Place for Developers.',
        }
        site, _ = update_or_create(SeoSite, pk=5, defaults=defaults)

        defaults = {
            'title': 'My jobs - development home page',
            'status': Configuration.STATUS_PRODUCTION,
            'browse_moc_show': True,
            'home_page_template': 'home_page/home_page_listing.html',
        }
        config, _ = update_or_create(Configuration, pk=3, defaults=defaults)
        site.configurations.add(config)

    @staticmethod
    def add_roles(company):
        """
        Creates the default activities and roles.
        Adds any user with is_superuser=True to the 'Admin'
        role.

        :param company: The company the role should be created for.

        """
        update_activities()

        company.app_access.add(*AppAccess.objects.all())

        superusers = User.objects.filter(is_superuser=True)
        role, _ = update_or_create(Role, name='Admin', company=company,
                                   defaults={})
        role.activities.add(*Activity.objects.all())
        role.user_set.add(*superusers)

        not_superusers = User.objects.exclude(is_superuser=True)
        role, _ = update_or_create(Role, name='Deactivated', company=company,
                                   defaults={})
        role.user_set.add(*not_superusers)

    def handle(self, *args, **options):
        """
        Create default development data to make running the app without
        access to real data easier.

        """
        self.add_base_users()
        self.add_base_sites()
