import sys
from django.core.management.base import BaseCommand
from django.db.models import F
from south.models import MigrationHistory

from seo.models import Company, CompanyUser
from myjobs.models import User, Role, Activity, AppAccess


class Command(BaseCommand):
    help = "Create PRM Users and enable PRM for member companies."

    def _create_prm_user_roles(self, company_users):
        """
        Creates the "PRM User" role for all companies who have a company
        user.
        """
        companies = Company.objects.filter(pk__in=company_users.values_list(
            'company', flat=True))

        # create roles for each of those companies
        Role.objects.bulk_create([
            Role(name="PRM User", company=company) for company in companies])

        print "Created `PRM User` roles for %s companies." % companies.count()

    def _assign_prm_users(self, company_users):
        """
        Assign company users the "PRM User" role if they aren't already
        assigned the "Admin" role.
        """
        # filter out users who already admins
        admins = company_users.filter(
            company__role__user__email=F('user__email'),
            company__role__name='Admin')

        # bulk create doesn't assign foreign keys when it's done so we manually
        # fetch them
        roles = {role.company: role
                 for role in Role.objects.filter(name="PRM User")}
        activities = Activity.objects.filter(app_access__name="PRM").distinct()

        # maps to myjobs_role_activities
        RoleActivities = Role.activities.through

        # asign every PRM activity to each of the newly created roles
        RoleActivities.objects.bulk_create([
            RoleActivities(role=role, activity=activity)
            for role in roles.values() for activity in activities], 450)

        # maps to myjobs_user_roles
        UserRoles = User.roles.through

        # directly populate the many to many table to avoid additional queries
        prm_users = company_users.exclude(pk__in=admins.values_list(
            'pk', flat=True))
        UserRoles.objects.bulk_create([
            UserRoles(
                role=roles[company_user.company], user=company_user.user)
            for company_user in prm_users])

        print "Created %s PRM Users from %s Company Users" % (
            UserRoles.objects.count(), CompanyUser.objects.count())

        company_user_count = company_users.count()
        admin_count = admins.count()
        if company_user_count != admin_count:
            print ("%s company users(s) skipped as they were already "
                   "assigned the Admin role." % admin_count)

    def _enable_prm_access(self):
        """
        Add `PRM` app access to any company who is a member.
        """

        companies = Company.objects.filter(member=True)
        disabled_companies = companies.exclude(app_access__name="PRM")
        app_access = AppAccess.objects.get(name="PRM")

        # maps to company_app_access
        CompanyAppAccess = Company.app_access.through

        # directly populate the many to many table to avoid additional queries
        CompanyAppAccess.objects.bulk_create([
            CompanyAppAccess(company=company, appaccess=app_access)
            for company in disabled_companies])

        print ("PRM access and reporting has been granted for %s "
               "member companies." % (companies.count()))

        company_count = companies.count()
        disabled_count = disabled_companies.count()

        if company_count != disabled_count:
            skipped = company_count - disabled_count
            print ("%s compan(y/ies) skipped because access to PRM and "
                   "reporting was already granted." % skipped)



    def handle(self, *args, **options):
        if not MigrationHistory.objects.filter(
                migration="0007_create_admin_roles").exists():
            sys.stderr.write(
                "This command should be run after migration "
                "`0007_create_admin_roles` has been applied. To do so, please "
                "migrate myjobs forward.")
            sys.exit(1)

        company_users = CompanyUser.objects.all()

        self._create_prm_user_roles(company_users)
        self._assign_prm_users(company_users)
        self._enable_prm_access()

