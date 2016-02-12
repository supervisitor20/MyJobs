from django.db.models import Q
from ajax_select import register, LookupChannel
from seo import models





@register('companies')
class CompaniesLookup(LookupChannel):
    model = models.Company
    min_length = 3

    def get_query(self, q, request):
        return self.model.objects.filter(name__icontains=q).order_by('name')

    def format_match(self, company):
        """
        Returns a string ot be used next to each company that displays how many
        admins belong to that company, or a warning if there aren't any.

        """
        template = "{name} ({count} users){warning}"
        count = company.company_user_count
        warning = "" if count else " **Might be a duplicate**"

        return template.format(name=company.name, count=count, warning=warning)

@register('all_sites')
class AllSitesLookup(LookupChannel):
    model = models.SeoSite
    min_length = 3

    def get_query(self, q, request):
        """Match on name or domain."""

        return self.model.objects.filter(
            Q(domain__icontains=q) | Q(name__icontains=q))
