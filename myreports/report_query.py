from mypartners.models import Status, Contact


report_queries = {}


def report_query(report_query_name):
    def register(report_query):
        report_queries[report_query_name] = report_query
        return report_query
    return register


def get_report_query(report_query_name):
    return report_queries[report_query_name]()


def list_of_str(qs):
    return [str(f) for f in qs.all()]


@report_query("Contacts")
class ContactReportType(object):
    fields = ['name', 'email', 'phone', 'locations', 'tags', 'notes']

    def report_query_set(self, company):
        qs = (Contact.objects.filter(partner__owner=company)
              .prefetch_related('locations', 'partner')
              .filter(approval_status__code__iexact=Status.APPROVED))
        return qs

    def extract(self, rec):
        result = dict((f, str(getattr(rec, f, None)))
                      for f in self.fields)
        result['tags'] = list_of_str(rec.tags)
        result['locations'] = list_of_str(rec.locations)
        result['notes'] = list_of_str(rec.locations)
        result['partner'] = rec.partner.name
        return result
