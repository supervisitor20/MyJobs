import json

from django.core.urlresolvers import reverse
from django.conf import settings

from mypartners.tests.test_views import MyPartnersTestCase
from mypartners.tests.factories import OutreachEmailAddressFactory
from myjobs.tests.factories import UserFactory


class NonUserOutreachTestCase(MyPartnersTestCase):
    """
        Tests related to the non user outreach single page app. These APIs provide data to the React-based
        application.
    """

    def setUp(self):
        super(NonUserOutreachTestCase, self).setUp()
        self.inbox = OutreachEmailAddressFactory(company=self.company)
        self.other_company_inbox = OutreachEmailAddressFactory()

    def test_inbox_list_api(self):
        """
            Verify that the inbox list API will properly return any inboxes for the current company.
        """
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code, 200, msg="assert nuo inbox view works for proper user")
        response_json = json.loads(response.content)

        self.assertEqual(len(response_json), 1, msg="assert only user's company's inbox returned")

        return_msg = "assert that the inbox that is returned is the one we created for the company"
        self.assertEqual(response_json[0]["pk"], self.inbox.pk, msg=return_msg)
        self.assertEqual(response_json[0]["fields"]["email"], self.inbox.email, msg=return_msg)

    def test_non_staff_cannot_use_view(self):
        """
            Temporary test. Ensure user cannot access this view if they are not staff. Remove when launching
            NonUserOutreach module.
        """
        non_staff_user = UserFactory(is_staff=False, email="testuser@test.com")
        self.client.login_user(non_staff_user)
        response = self.client.get(reverse('api_get_nuo_inbox_list'), follow=False)
        self.assertEqual(response.status_code, 404, msg="ensure NUO inboxes returns 404 for non staff users")

    def test_user_requires_prm_access(self):
        """
            Verify that the has_access("prm") decorator works properly with this module when
            ROLES_ENABLED is set to false
        """
        settings.ROLES_ENABLED = False
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code, 200, msg="assert view loaded properly for prm access user")

        non_company_user = UserFactory(email="testuser@test.com")
        self.client.login_user(non_company_user)
        response = self.client.get(reverse('api_get_nuo_inbox_list'))
        self.assertEqual(response.status_code, 404, msg="assert NUO inboxes returns 404 for a user that is not"
                                                        " a company user for a member company")
