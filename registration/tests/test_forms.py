from django.core import mail

from myjobs.models import User
from myjobs.tests.factories import UserFactory
from registration.forms import (
    RegistrationForm, CustomPasswordResetForm, CustomSetPasswordForm)
from myjobs.tests.setup import MyJobsBase


class RegistrationFormTests(MyJobsBase):
    """
    Test the default registration forms.

    """

    def test_registration_form(self):
        """
        Test that ``RegistrationForm`` enforces username constraints
        and matching passwords.

        """
        # Create a user so we can verify that duplicate usernames aren't
        # permitted.
        User.objects.create_user(**{
            'email':'alice1@example.com', 'password1':'5UuYquA@'})

        invalid_data_dicts = [
            # Already-existing username.
            {'data': {'email': 'alice@example.com',
                      'password1': '5UuYquA@',
                      'password2': '5UuYquA@'},
            #__all__ refers to a form level error.
            'error': [['__all__', [u"A user with that email already exists."]]]},
            # Mismatched passwords.
            {'data': {'email': 'foo@example.com',
                      'password1': '5UuYquA@',
                      'password2': 'bar'},
            'error': [['password1', [u"The new password fields did not match."]],
                     ['password2', [u"The new password fields did not match."]]]},
            ]

        for invalid_dict in invalid_data_dicts:
            form = RegistrationForm(data=invalid_dict['data'])
            self.failIf(form.is_valid())

            self.assertEqual(form.errors[invalid_dict['error'][0][0]],
                             invalid_dict['error'][0][1])

        form = RegistrationForm(data={'email': 'foo@example.com',
                                      'password1': '5UuYquA@',
                                      'password2': '5UuYquA@'})
        self.failUnless(form.is_valid())

    def test_custom_password_reset_form(self):
        form = CustomPasswordResetForm({'email':self.user.email})
        self.assertTrue(form.is_valid())
        user = UserFactory(email='alice2@example.com', is_active=False)
        form = CustomPasswordResetForm({'email':user.email})
        self.assertTrue(form.is_valid())

    def test_reset_ignores_history(self):
        """
        Initiating a password reset should not add to password history.

        """
        self.company.password_expiration = True
        self.company.save()
        form = CustomPasswordResetForm({'email': self.user.email})
        self.assertTrue(form.is_valid())
        form.save()
        self.assertEqual(0, self.user.userpasswordhistory_set.count())

    def test_invalid_password_reset(self):
        self.assertEqual(len(mail.outbox), 0)
        form = CustomPasswordResetForm({'email': 'doesnt_exist@example.com'})
        self.assertTrue(form.is_valid())
        form.save()
        self.assertEqual(len(mail.outbox), 0)

    def test_reset_lockout(self):
        """
        The reset form zeros a password lockout on success.
        """
        (self.alice, _) = User.objects.create_user(**{
            'email': 'alice1@example.com', 'password1': '5UuYquA@'})
        self.alice.failed_login_count = 99999
        self.alice.save()

        form = CustomSetPasswordForm(
            self.alice,
            {
                'new_password1': '82Ywe4$cc',
                'new_password2': '82Ywe4$cc',
            })
        self.assertTrue(form.is_valid())
        form.save()
        self.assertEqual(self.alice.failed_login_count, 0)
        self.assertTrue(self.alice.check_password('82Ywe4$cc'))
