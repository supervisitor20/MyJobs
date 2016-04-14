from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, Http404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.generic import View, RedirectView

from seo.forms import settings_forms


class EmailDomainFormView(View):
    base_template_context = {
        'custom_action': 'Edit',
        'display_name': 'Email Domains'
    }
    template = 'postajob/form.html'

    def success_url(self):
        return reverse('purchasedmicrosite_admin_overview')

    def get(self, request):
        form = settings_forms.EmailDomainForm(request=request)
        kwargs = dict(self.base_template_context)
        kwargs.update({
            'form': form,
        })
        return render_to_response(self.template, kwargs,
                                  context_instance=RequestContext(request))

    def post(self, request):
        form = settings_forms.EmailDomainForm(request.POST, request=request)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(self.success_url())
        kwargs = dict(self.base_template_context)
        kwargs.update({
            'form': form,
        })
        return render_to_response(self.template, kwargs,
                                  context_instance=RequestContext(request))


def secure_redirect(request, page):
    """
    Redirects to the correct path on secure.my.jobs if this is not a network
    site, or 404 if it is.
    """
    if settings.SITE.site_tags.filter(site_tag='network').exists():
        return RedirectView.as_view(
            url='https://secure.my.jobs/%s' % page)(request)
    else:
        raise Http404("seo.views.settings_views.secure_redirect: not a "
                      "network site")
