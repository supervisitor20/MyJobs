from django.core.management.base import BaseCommand

from seo.models import Company, CompanyUser
from myjobs.models import User, Role, Activity


class Command(BaseCommand):
    help = "Import Partners, Contacts, and ContactRecords from a JSON files."

    def handle(self, *args, **options):
        company_users = CompanyUser.objects.all()
        companies = Company.objects.filter(pk__in=company_users.values_list(
            'company', flat=True))

        # create roles for each of those companies
        Role.objects.bulk_create([
            Role(name="PRM User", company=company) for company in companies])

        roles = Role.objects.filter(name="PRM User")
        activities = Activity.objects.filter(app_access__name="PRM").distinct()

        # maps to myjobs_role_activities
        RoleActivities = Role.activities.through

        # asign every PRM activity to each of the newly created roles
        RoleActivities.objects.bulk_create([
            RoleActivities(role=role, activity=activity)
            for role in roles for activity in activities], 450)

        # maps to myjobs_user_roles
        UserRoles = User.roles.through

        for company_user in company_users:
            company_user.user.roles.add(Role.objects.get(
                name="PRM User", company=company_user.company))

        print "Created %s PRM Users from %s Company Users" % (
            UserRoles.objects.count(), CompanyUser.objects.count())
