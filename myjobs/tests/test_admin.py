from django.core import mail
from django.core.urlresolvers import reverse

from myjobs.tests.factories import UserFactory
from myjobs.tests.setup import MyJobsBase
from seo.tests.factories import SeoSiteFactory


class MyJobsAdminTests(MyJobsBase):
    def setUp(self):
        super(MyJobsAdminTests, self).setUp()
        self.user.set_password('5UuYquA@')
        self.user.is_superuser = True
        self.user.save()
        self.account_owner = UserFactory(email='owner@example.com')
        SeoSiteFactory(domain='secure.my.jobs')
        mail.outbox = []

        self.data = {'_selected_action': [unicode(self.account_owner.pk)],
                     'action': 'request_account_access'}

    def test_request_access_to_staff(self):
        """
        Requesting access to a staff/superuser account is not allowed.
        """
        self.account_owner.is_staff = True
        self.account_owner.save()

        # Selecting the action in the User changelist and pressing "OK" should
        # immediately show a notification at the top of the page.
        response = self.client.post(
            reverse('admin:myjobs_user_changelist'),
            self.data, follow=True)
        self.assertEqual(len(mail.outbox), 0)
        self.assertContains(response, ("Requesting access to staff or "
                                       "superusers is not supported."))

        # Manually constructing a post to the relevant url should redirect
        # to the User changelist and not send notification emails.
        response = self.client.post(
            reverse('request-account-access',
                    kwargs={'uid': self.account_owner.pk}),
            {'reason': 'reason here'})

        self.assertRedirects(response, reverse('admin:myjobs_user_changelist'))
        self.assertEqual(len(mail.outbox), 0)

    def test_request_access_to_non_staff(self):
        """
        Requesting access to a non-staff/superuser account succeeds if the
        target is not a staff/superuser account and the requesting staff
        member provides a reason.
        """
        # Request access to an account to get to the request form.
        response = self.client.post(
            reverse('admin:myjobs_user_changelist'),
            self.data, follow=True)
        self.assertContains(response, "What is the nature of this request?",
                            msg_prefix="Did not redirect to the request form")
        url = reverse('request-account-access',
                      kwargs={'uid': self.account_owner.pk})
        last_redirect = response.redirect_chain[-1][0]

        # If the admin action determines that it is valid, it redirects. Ensure
        # we redirected to the expected location.
        self.assertTrue(last_redirect.endswith(url),
                        msg="Did not redirect as expected")

        # Try submitting the request form without a reason.
        response = self.client.post(url)
        self.assertContains(response, "This field is required.",
                            msg_prefix=("Form error not present on invalid "
                                        "submission"))
        self.assertEqual(len(mail.outbox), 0,
                         msg="Mail sent despite form errors")

        # # Submit again, providing a reason.
        self.client.post(url, {'reason': 'reason here'})
        self.assertEqual(len(mail.outbox), 1,
                         msg="Mail did not send on successful form submission")
        email = mail.outbox[0]
        self.assertTrue(self.account_owner.email in email.to,
                        msg="Email was sent to the wrong user")
        self.assertTrue('reason here' in email.body,
                        msg="Account access reason was not in the sent email")
