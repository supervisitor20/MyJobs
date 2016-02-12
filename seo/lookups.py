from ajax_select import register, LookupChannel
from seo.models import Company

from mypartners.admin import format_company_name

@register('companies')
class CompaniesLookup(LookupChannel):
    model = Company
    min_length = 3

    def get_query(self, q, request):
        return self.model.objects.filter(name__icontains=q).order_by('name')

    def format_match(self, company):
        return format_company_name(company)

