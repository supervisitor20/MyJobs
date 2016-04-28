from django.db.models import Q
from ajax_select import register, LookupChannel
from redirect import models

@register('view_sources')
class ViewSourcesLookup(LookupChannel):
    model = models.ViewSource

    def get_query(self, q, request):
        return self.model.objects.filter(
                Q(view_source_id__startswith=q) | Q(name__istartswith=q))[:10]

    def get_result(self, obj):
        return unicode(obj.view_source_id)
