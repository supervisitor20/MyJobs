import sys
from django.core.management.base import BaseCommand
from south.models import MigrationHistory

from seo.models import Company, CompanyUser
from myjobs.models import User, Role, Activity


class Command(BaseCommand):
    help = "Import Partners, Contacts, and ContactRecords from a JSON files."

    def handle(self, *args, **options):
        if not MigrationHistory.objects.filter(
                migration="0007_create_admin_roles").exists():
            sys.stderr.write(
                "This command should be run after migration "
                "`0007_create_admin_roles` has been applied. To do so, please "
                "migrate myjobs forward.")
            sys.exit(1)

        company_users = CompanyUser.objects.all()
        companies = Company.objects.filter(pk__in=company_users.values_list(
            'company', flat=True))

        # create roles for each of those companies
        Role.objects.bulk_create([
            Role(name="PRM User", company=company) for company in companies])

        # bulk create doesn't assign foreign keys when it's done
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
        UserRoles.objects.bulk_create([
            UserRoles(
                role=roles[company_user.company], user=company_user.user)
            for company_user in company_users])

        print "Created %s PRM Users from %s Company Users" % (
            UserRoles.objects.count(), CompanyUser.objects.count())
