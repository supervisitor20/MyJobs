from celery.task import task
from datetime import datetime, timedelta
import operator

from django.contrib.auth.models import ContentType
from django.contrib.contenttypes.generic import GenericForeignKey
from django.core.mail import send_mail
from django.db import models, OperationalError
from django.db.models.signals import pre_save, post_save
from django.template import Template, Context
from django.utils.translation import ugettext_lazy as _
from seo.models import CompanyUser


class EmailSection(models.Model):
    SECTION_TYPES = (
        (1, 'Header'),
        (2, 'Body'),
        (3, 'Footer'),
    )

    name = models.CharField(max_length=255)
    owner = models.ForeignKey('seo.Company', blank=True, null=True)
    section_type = models.PositiveIntegerField(choices=SECTION_TYPES)
    content = models.TextField()

    def __unicode__(self):
        return "%s (%s)" % (self.name, self.owner or "Global")


class EmailTemplate(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey('seo.Company', blank=True, null=True)
    header = models.ForeignKey('EmailSection', related_name='header_for')
    body = models.ForeignKey('EmailSection', related_name='body_for')
    footer = models.ForeignKey('EmailSection', related_name='footer_for')

    def __unicode__(self):
        return "%s (%s)" % (self.name, self.owner or "Global")

    @staticmethod
    def build_context(for_object):
        """
        Builds context based on a generic number of things that
        a user might want to include in an email.

        Inputs:
        :for_object: The object the context is being built for.
        :return: A dictionary of context for the templates to use.

        """
        context = for_object.context()
        return Context(context)

    def render(self, for_object):
        """
        Renders the EmailTemplate for a given object.

        Inputs:
        :for_object: The object the email is being rendered for.
        :return: The rendered email.
        """
        context = self.build_context(for_object)
        template = Template('\n'.join([self.header.content, self.body.content,
                                       self.footer.content]))
        return template.render(context)


class Event(models.Model):
    email_template = models.ForeignKey('EmailTemplate')
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey('seo.Company')
    sites = models.ManyToManyField('seo.SeoSite')
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return "%s (%s)" % (self.name, self.owner)

    class Meta:
        abstract = True

    def schedule_task(self, for_object):
        """
        Creates an EmailTask for the for_object.

        Inputs:
        :for_object: The object that will have an email sent for it
                     in the future.

        Returns:
        :return: The created EamilTask.
        """
        return EmailTask.objects.create(
            act_on=for_object,
            related_event=self,
            scheduled_for=self.schedule_for(for_object)
        )

    def schedule_for(self, for_object):
        """
        Determines what time an event should be scheduled for; Unless
        overridden, this defaults to right now.

        Inputs:
        :for_object: Object being scheduled; not used in the default method.

        Returns:
        :return: Time to schedule an event.
        """
        return datetime.now()

    def send_email(self, for_object):
        """
        Sends an email for a for_object.

        Inputs:
        :for_object: The object an email is being sent for.
        """
        subject = ''
        if self.model.model == 'purchasedjob':
            # host company to purchaser
            recipient_company = for_object.owner
            sending_company = for_object.purchased_product.product.owner
        elif self.model.model == 'purchasedproduct':
            # host company to purchaser
            recipient_company = for_object.owner
            sending_company = for_object.product.owner
        elif self.model.model == 'request':
            # purchaser to host company
            recipient_company = for_object.owner
            sending_company = for_object.requesting_company()
            subject = '%s has submitted a new request' % sending_company.name
        elif self.model.model == 'invoice':
            # host company to purchaser
            recipient_company = for_object.purchasedproduct_set.first()\
                .product.owner
            sending_company = for_object.owner
            subject = 'Your invoice from %s' % sending_company.name
        else:
            raise NotImplementedError('Add %s here somewhere!' %
                                      self.model.model)

        if not subject:
            subject = 'An update on your %s' % self.model.name

        recipients = CompanyUser.objects.filter(
            company=recipient_company).values_list('user__email',
                                                   flat=True)
        if hasattr(sending_company, 'companyprofile'):
            email_domain = sending_company.companyprofile.outgoing_email_domain
        else:
            email_domain = 'my.jobs'

        body = self.email_template.render(for_object)
        send_mail(subject, body, '%s@%s' % (self.model.model, email_domain),
                  recipients)


CRON_EVENT_MODELS = ['purchasedjob', 'purchasedproduct']
VALUE_EVENT_MODELS = ['purchasedjob', 'purchasedproduct', 'request']
CREATED_EVENT_MODELS = ['invoice']
ALL_EVENT_MODELS = set().union(CRON_EVENT_MODELS, VALUE_EVENT_MODELS,
                               CREATED_EVENT_MODELS)


class CronEvent(Event):
    model = models.ForeignKey(ContentType,
                              limit_choices_to={'model__in': [
                                  'purchasedjob',
                                  'purchasedproduct']})
    field = models.CharField(max_length=255, blank=True)
    minutes = models.IntegerField()

    def schedule_for(self, for_object):
        """
        Determines what time for_object should be scheduled.

        Inputs:
        :for_object: Object being used to determine send time.

        Returns:
        :return: The next valid time this Event would be scheduled for.
        """
        base_time = getattr(for_object, self.field, datetime.now())
        if base_time is None or base_time == '':
            base_time = datetime.now()
        return base_time + timedelta(minutes=self.minutes)


class ValueEvent(Event):
    COMPARISON_CHOICES = (
        ('eq', 'is equal to'),
        ('ge', 'is greater than or equal to'),
        ('le', 'is less than or equal to'),
    )

    compare_using = models.CharField(_('Comparison Type'),
                                     max_length=255, choices=COMPARISON_CHOICES)
    model = models.ForeignKey(ContentType,
                              limit_choices_to={'model__in': [
                                  'purchasedjob',
                                  'purchasedproduct',
                                  'request']})
    field = models.CharField(max_length=255)
    value = models.PositiveIntegerField()


class CreatedEvent(Event):
    model = models.ForeignKey(ContentType,
                              limit_choices_to={'model__in': [
                                  'invoice'
                              ]})


class EmailTask(models.Model):
    # Object being used to generate this email
    object_id = models.PositiveIntegerField()
    object_model = models.ForeignKey(ContentType, related_name='email_model')
    act_on = GenericForeignKey('object_model', 'object_id')

    # Event type of this email
    event_id = models.PositiveIntegerField()
    event_model = models.ForeignKey(ContentType, related_name='email_type')
    related_event = GenericForeignKey('event_model', 'event_id')

    completed_on = models.DateTimeField(blank=True, null=True)

    scheduled_for = models.DateTimeField(default=datetime.now)
    scheduled_at = models.DateTimeField(auto_now_add=True)

    task_id = models.CharField(max_length=36, blank=True, default='',
                               help_text='guid with dashes')

    @property
    def completed(self):
        return bool(self.completed_on)

    def schedule(self):
        """
        Submits this task to Celery for processing.
        """
        send_event_email.apply_async(args=[self], eta=self.scheduled_for)

    def send_email(self):
        self.related_event.send_email(self.act_on)


# I don't really like doing it this way (get from database pre save, set
# attribute, get again post save), but we need to be able to 1) determine what
# was changed and 2) only send an email if the save is successful. - TP
def cron_post_save(sender, instance, **kwargs):
    """
    Finds and schedules tasks for any CronEvents bound to the given instance.

    Inputs:
    :sender: Which event type was saved
    :instance: Specific instance saved
    """
    content_type = ContentType.objects.get_for_model(sender)
    cron_event_kwargs = {'model': content_type,
                         'owner': instance.product.owner if hasattr(
                             instance, 'product') else instance.owner}
    # Gets all CronEvents for this company and model...
    events = list(CronEvent.objects.filter(**cron_event_kwargs))
    # ...and all tasks scheduled for this instance.
    tasks = EmailTask.objects.filter(
        object_id=instance.pk,
        object_model=content_type)
    triggered_events = {task_.related_event for task_ in tasks}
    for event in triggered_events:
        if event in events:
            # If an event is already scheduled, remove it from the list of
            # events to be scheduled.
            events.pop(events.index(event))
    for event in events:
        # Schedule all remaining events.
        EmailTask.objects.create(act_on=instance,
                                 related_event=event).schedule()


def value_pre_save(sender, instance, **kwargs):
    """
    Determines if a given ValueEvent bound to the provided instance has been
    triggered.

    Inputs:
    :sender: Which event type is being saved
    :instance: Specific instance being saved
    """
    triggered = []
    if instance.pk:
        value_event_kwargs = {
            'model': ContentType.objects.get_for_model(sender),
            'owner': instance.product.owner if hasattr(
                instance, 'product') else instance.owner}
        events = ValueEvent.objects.filter(**value_event_kwargs)
        original = sender.objects.get(pk=instance.pk)
        for event in events:
            old_val = getattr(original, event.field)
            new_val = getattr(instance, event.field)
            compare = getattr(operator, event.compare_using, 'eq')
            # This should only be triggered once when the conditions are met
            # (value <= 3 fires once value reaches 3 and does not fire again
            # when value reaches 2). Check the pre-save value in addition to
            # the post-save value to ensure this.
            if (not compare(old_val, event.value) and
                    compare(new_val, event.value)):
                triggered.append(event.pk)
    instance.triggered = triggered


def value_post_save(sender, instance, **kwargs):
    """
    Schedules any triggered events found in value_pre_save.

    Inputs:
    :sender: Which event type is being saved
    :instance: Specific instance being saved
    """
    if instance.triggered:
        events = ValueEvent.objects.filter(id__in=instance.triggered)
        for event in events:
            EmailTask.objects.create(act_on=instance,
                                     related_event=event).schedule()


def pre_add_invoice(sender, instance, **kwargs):
    """
    Determines if an invoice has been added to the provided instance.

    Inputs:
    :sender: Which event type is being saved
    :instance: Specific instance being saved
    """
    invoice_added = hasattr(instance, 'invoice')
    if instance.pk:
        original = sender.objects.get(pk=instance.pk)
        invoice_added = not hasattr(original, 'invoice') and invoice_added
    instance.invoice_added = invoice_added


def post_add_invoice(sender, instance, **kwargs):
    """
    Schedules tasks for the instance if pre_add_invoice determined that an
    invoice was added.

    Inputs:
    :sender: Which event type is being saved
    :instance: Specific instance being saved
    """
    if instance.invoice_added:
        content_type = ContentType.objects.get(model='invoice')
        events = CreatedEvent.objects.filter(model=content_type,
                                             owner=instance.product.owner)
        for event in events:
            EmailTask.objects.create(act_on=instance.invoice,
                                     related_event=event).schedule()


bind_events = lambda type_, sender, pre=None, post=None: [
    pre_save.connect(pre, sender=sender,
                     dispatch_uid='pre_save__%s_%s' % (
                         model, type_)) if pre else None,
    post_save.connect(post, sender=sender,
                      dispatch_uid='post_save__%s_%s' % (
                          model, type_)) if post else None]
"""
Binds the provided sender to pre_save and post_save signals.

Inputs:
:type_: Type of event being bound (cron, value, created)
:sender: Model being bound
:pre: Method to be bound to the pre_save signal; default: None
:post: Method to be bound to the post_save signal; default: None
"""

try:
    for model in ALL_EVENT_MODELS:
        Model = ContentType.objects.get(model=model).model_class()
        if model in CRON_EVENT_MODELS:
            bind_events('cron', Model, post=cron_post_save)
        if model in VALUE_EVENT_MODELS:
            bind_events('value', Model, value_pre_save, value_post_save)
        if model in CREATED_EVENT_MODELS:
            if model == 'invoice':
                # Invoice is a foreign key on PurchasedProduct; bind this
                # signal to PurchasedProduct instead.
                PurchasedProduct = ContentType.objects.get(
                    model='purchasedproduct').model_class()
                bind_events('created', PurchasedProduct,
                            pre_add_invoice, post_add_invoice)
            else:
                # There are no other valid models for this choice, but there
                # likely will be in the future. I'm not writing something that
                # will certainly be wrong, so let's put it off until it's
                # relevant. - TP
                raise NotImplementedError('Add some signals for %s!' % model)
except OperationalError:
    # We're running syncdb and the ContentType table doesn't exist yet
    pass


@task(name="tasks.send_event_email", ignore_result=True)
def send_event_email(email_task):
    """
    Send an appropriate email given an EmailTask instance.

    Inputs:
    :email_task: EmailTask we are using to generate this email
    """
    email_task.task_id = send_event_email.request.id
    email_task.save()

    email_task.send_email()

    email_task.completed_on = datetime.now()
    email_task.save()
