from ajax_select import register, LookupChannel
from seo import models

@register('companies')
class CompaniesLookup(LookupChannel):
    model = Company
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

@register('sites')
class SitesLookup(LookupChannel):
    model = models.SeoSite
    min_length = 3

    def get_query(self, q, request):
        """Match on name or domain."""

        return self.model.objects.filter(
            Q(domain__startswith=q) | Q(name__startswith=q))[:10]

    # See https://github.com/crucialfelix/django-ajax-selects/issues/153 for
    # why this is necessary. Inherited models don't act correctly, so we help
    # the framework out by manually returning results.
    def get_objects(self, ids):
        return list(self.model.objects.filter(pk__in=ids))

