import json

from django.core.urlresolvers import reverse

from mypartners.tests.test_views import MyPartnersTestCase
from mypartners.tests.factories import OutreachEmailAddressFactory


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
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.content)

        # assert that there are no additional inboxes returned
        self.assertEqual(len(response_json), 1)

        # assert that the inbox that is returned is the one we created for the company
        self.assertEqual(response_json[0]["pk"], self.inbox.pk)
        self.assertEqual(response_json[0]["fields"]["email"], self.inbox.email)
