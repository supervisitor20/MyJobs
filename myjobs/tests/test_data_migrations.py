from django.test import TestCase
from myjobs.tests.factories import RoleFactory, ActivityFactory
from myjobs.models import Role
from seo.tests.factories import CompanyFactory
from seo.models import Company


class TestAdminRoleCreation(TestCase):
    """
    These tests ensure that the logic within various data migrations don't
    perform too many queries.
    """

    def setUp(self):
        self.companies = CompanyFactory.create_batch(100)
        self.activities = ActivityFactory.create_batch(20)

    def test_creating_roles_in_bulk(self):
        """
        Creating multiple roles at once assigned to different companies should
        still result in two queries: one to get companies, and the other to
        create roles.
        """

        with self.assertNumQueries(2):
            Role.objects.bulk_create([
                Role(name="Role Admin", company=company)
                for company in Company.objects.all()])

        self.assertEqual(Role.objects.count(), 100)

    def test_assigning_activities_in_bulk(self):
        """
        Assigning a list of activities to a bunch of roles should only in a
        single query.
        """

        roles = [RoleFactory(name="Role Admin", company=company)
                 for company in self.companies]

        with self.assertNumQueries(1):
            RoleActivities = Role.activities.through
            RoleActivities.objects.bulk_create([
                RoleActivities(role=role, activity=activity)
                for role in roles for activity in self.activities])

        for role in Role.objects.all():
            self.assertEqual(role.activities.count(), 20)
