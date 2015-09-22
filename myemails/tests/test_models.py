from datetime import datetime, timedelta

from django.contrib.contenttypes.models import ContentType
from django.core import mail

from myemails.tests import factories
from myjobs.tests.setup import MyJobsBase
from mysearches.tests.factories import SavedSearchFactory
from postajob.models import PurchasedJob, Invoice
from postajob.tests import factories as posting_factories
from seo.tests.factories import CompanyUserFactory


class EmailTemplateTests(MyJobsBase):
    def test_email_template_render(self):
        product = posting_factories.ProductFactory()
        email_template = factories.EmailTemplateFactory(
            header__content="This is a header. {{product_name}}")
        rendered_email = email_template.render(product)

        # Default email content comes from the
        default_email = 'This is a header. %s\nThis is a body.\n' \
                        'This is a footer.' % product.name
        self.assertEqual(rendered_email, default_email)


class EventTests(MyJobsBase):
    def setUp(self):
        super(EventTests, self).setUp()
        self.product = posting_factories.ProductFactory()
        self.company_user = CompanyUserFactory(company=self.product.owner)

        self.purchased_product = posting_factories.PurchasedProductFactory(
            product=self.product, owner=self.product.owner)

        ct = ContentType.objects.get_for_model(Invoice)
        self.created_event = factories.EventFactory(
            model=ct, owner=self.product.owner)

        self.created_template = factories.EmailTemplateFactory(
            event=self.created_event,
            is_active=True)

    def test_generate_initial_email(self):
        posting_factories.PurchasedProductFactory(
            product=self.product, owner=self.product.owner)
        template = self.created_event.active_template()
        for part in [
                template.header.content,
                template.body,
                template.footer.content]:
            self.assertTrue(part in mail.outbox[0].body)
        return
