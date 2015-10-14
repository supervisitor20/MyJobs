import uuid
import factory


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'myjobs.User'

    email = 'alice@example.com'
    gravatar = 'alice@example.com'
    password = '5UuYquA@'
    user_guid = factory.LazyAttribute(lambda n: '{0}'.format(uuid.uuid4()))
    is_active = True
    is_verified = True

    @classmethod
    def _prepare(cls, create, **kwargs):
        password = kwargs.pop('password', None)
        user = super(UserFactory, cls)._prepare(create, **kwargs)
        if password:
            user.set_password(password)
            if create:
                user.save()
        return user

    @factory.post_generation
    def roles(self, create, extracted, **kwargs):
        if not create:
            return

        roles = extracted or []
        self.roles.add(*roles)

class AppAccessFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'myjobs.AppAccess'

    name = factory.Sequence(lambda n: 'Test App %s' % n)


class ActivityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model =  'myjobs.Activity'

    app_access = factory.SubFactory(AppAccessFactory)
    name = factory.Sequence(lambda n: 'test activity %s' % n)


class RoleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = 'myjobs.Role'

    company = factory.SubFactory('myjobs.tests.factories.CompanyFactory')
    name = factory.Sequence(lambda n: 'test role %s' % n)

    @factory.post_generation
    def activities(self, create, extracted, **kwargs):

        if not create:
            return

        activities = extracted or []
        self.activities.add(*activities)
