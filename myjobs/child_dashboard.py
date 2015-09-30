import json
import logging

from django.views.decorators.csrf import (
    csrf_exempt as django_csrf_exempt)

from myjobs.autoserialize import autoserialize
from myjobs.cross_site_verify import cross_site_verify

from myblocks.models import Block

logger = logging.getLogger(__name__)


# The django csrf exemption should stay first in this list.
@django_csrf_exempt
@cross_site_verify
@autoserialize
def child_dashboard(request):
    try:
        if request.method == 'POST':
            blocks = json.loads(request.body)[u'blocks']
        else:
            blocks = json.loads(request.GET['blocks'])
    except:
        logger.warn('secure block parse error: %r %r',
                    request.body,
                    request.GET,
                    exc_info=True)
        return {"error": "failed to parse request"}

    response = {}

    for element_id in blocks:
        block = Block.objects.filter(element_id=element_id).first()
        if block is None:
            logger.warn("Failed block lookup: %s", element_id)
        else:
            rendered = block.render_for_ajax(request, blocks[element_id])
            response[element_id] = rendered

    return response
