===============
Secure Blocks
===============

Secure Blocks are blocks retrieved via an AJAX call to an API. These blocks are
small reusable components that can be added to any webpage that is tied to a
secure (log in enabled, https) webpage.

Cross Site Verify
=================

Cross Site Verification was designed to satisfy the need for innumerable https
certificates in order to supply user information for display on various
microsites. With this solution, one secure site can manage user information for
multiple child sites.

For cross site verification to work, a nonsecure site (http) must be the child
site of a secure site (https). When a cross site API call is made via CORS or
JSONP, the parent site verifies the request to ensure the origin of the call
is from a valid child site. If the microsite does not have a parent site and
is a secure site, it makes the call to and returns from itself.

.. autofunction:: myjobs.cross_site_verify.cross_site_verify

Secure Blocks Widgets
=====================

Within a microsites page, a div can be created with a special data key
(data-secure-block-id). This tag indicates that the value of that key is tied
to secure block which should be loaded into the contents of that div. One API
call is made to the parent of the microsite (or itself, if it has no parent) to
retrieve all secure blocks divs. The request is subject to the cross site
verification step above.

.. autofunction:: myblocks.views.secure_blocks

.. autoclass:: myblocks.models.

Saved Search Widget
===================

The Saved Search widget is the first of the secure-blocks widgets to have
complex functionality. It incorporates Javascript, CSS, and HTML.