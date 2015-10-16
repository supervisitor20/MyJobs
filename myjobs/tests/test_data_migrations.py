from django.test import TestCase
from myjobs.models import Role
from seo.tests.factories import CompanyFactory
from seo.models import Company


class TestAdminRoleCreation(TestCase):
    def setUp(self):
        self.company = CompanyFactory.create_batch(100)

    def test_creating_roles_in_bulk(self):
        """
        Creating multiple roles at once assigned to different companies should
        still result in one query.
        """

        with self.assertNumQueries(2):
            Role.objects.bulk_create([
                Role(name="Role Admin", company=company)
                for company in Company.objects.all()])
