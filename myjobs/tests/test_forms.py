from django.core.urlresolvers import reverse

from myjobs.forms import ChangePasswordForm
from myjobs.models import CompanyAccessRequest
from myjobs.tests.factories import UserFactory, CompanyAccessRequestFactory
from myprofile.tests.factories import PrimaryNameFactory
import hashlib
from setup import MyJobsBase


class AccountFormTests(MyJobsBase):
    def setUp(self):
        super(AccountFormTests, self).setUp()
        self.name = PrimaryNameFactory(user=self.user)

    def test_password_form(self):
        invalid_data = [
            {'data': {'password': 'cats',
                      'new_password1': '7dY=Ybtk',
                      'new_password2': '7dY=Ybtk'},
             u'errors': [['password', [u"Wrong password."]]]},
            {'data': {'password': '5UuYquA@',
                      'new_password1': '7dY=Ybtk',
                      'new_password2': 'notnewpassword'},
             u'errors': [[u'new_password2',
                         [u'The new password fields did not match.']],
                         [u'new_password1',
                         [u'The new password fields did not match.']]], },
        ]

        for item in invalid_data:
            form = ChangePasswordForm(user=self.user, data=item['data'])
            self.failIf(form.is_valid())
            self.assertEqual(form.errors[item[u'errors'][0][0]],
                             item[u'errors'][0][1])

        form = ChangePasswordForm(user=self.user,
                                  data={'password': '5UuYquA@',
                                        'new_password1': '7dY=Ybtk',
                                        'new_password2': '7dY=Ybtk'})

        self.failUnless(form.is_valid())
        form.save()
        self.failUnless(self.user.check_password('7dY=Ybtk'))


class CompanyAccessRequestFormTests(MyJobsBase):
    def test_approval_form_authenticates_request(self):
        """
        Submitting a valid authentication code should result in the request
        being updated and a new admin being assigned.
        """

        # required for django admin during tests, apparently
        self.user.is_superuser = True
        self.user.save()

        # give us a handle to the unhashed access code
        access_code = '1234ABCD'
        user = UserFactory(email="requestuser@example.com")
        request = CompanyAccessRequestFactory(
            access_code=hashlib.md5(access_code).hexdigest(),
            requested_by=user)

        # code shouldn't have been authorized yet
        self.assertFalse(request.authorized_by)

        data = {
            "company": self.company.pk,
            "verification_code": access_code
        }
        admin_url = "%s%s/" % (
            reverse("admin:myjobs_companyaccessrequest_changelist"),
            request.pk)
        self.client.post(path=admin_url, data=data)

        # object is cached so we need to refetch it
        request = CompanyAccessRequest.objects.get(pk=request.pk)
        self.assertEqual(request.authorized_by, self.user)
