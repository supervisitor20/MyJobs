from django.apps import apps, AppConfig
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

class MyEmailsConfig(AppConfig):
    name = "myemails"

    def ready(self):
        Event = self.get_model("Event")
        EmailTask = self.get_model("EmailTask")
        Invoice = apps.get_model('postajob', 'Invoice')
        PurchasedProduct = apps.get_model('postajob', 'PurchasedProduct')

        # I don't really like doing it this way (get from database pre save, set
        # attribute, get again post save), but we need to be able to 1) determine what
        # was changed and 2) only send an email if the save is successful. - TP

        @receiver(pre_save, sender=Invoice, weak=False)
        @receiver(pre_save, sender=PurchasedProduct, weak=False)
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

        @receiver(post_save, sender=Invoice, weak=False)
        @receiver(post_save, sender=PurchasedProduct, weak=False)
        def post_add_invoice(sender, instance, **kwargs):
            """
            Schedules tasks for the instance if pre_add_invoice determined that an
            invoice was added.

            Inputs:
            :sender: Which event type is being saved
            :instance: Specific instance being saved
            """
            from django.contrib.auth.models import ContentType
            if instance.invoice_added:
                content_type = ContentType.objects.get(model='invoice')
                events = Event.objects.filter(model=content_type,
                                              owner=instance.product.owner)
                for event in events:
                    EmailTask.objects.create(act_on=instance.invoice,
                                             related_event=event).schedule()
