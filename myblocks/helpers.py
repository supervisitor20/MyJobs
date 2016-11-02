from django.core.urlresolvers import reverse


def success_url(request):
    # So if we didn't specify the url, redirect to the homepage.
    return request.GET.get('next', reverse('home'))
