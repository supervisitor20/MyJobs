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
(data-secure-block-id). This tag indicates that the value of that data
attribute is tied to a secure block element_id which should be loaded into the
contents of that div. One API call is made to the parent of the microsite
(or itself, if it has no parent) to retrieve all secure blocks divs.
The request is subject to the cross site verification step above.

.. autofunction:: myblocks.views.secure_blocks

.. autoclass:: myblocks.models.SecureBlock
    :members:

Testing a Secure Block Widget
------------------------------

To test a secure block widget, do the following:

* Navigate to Django Admin

* If parent site relationship is not set up, do the following:

 * Navigate to Company, edit desired child company (currently my.jobs)

 * Under "parent_site" drop down, select desired parent site (secure.my.jobs)

 * Save

* Locate the correct model under MyBlocks (ex. SavedSearchWidgetBlock)

* Add new block

 * The only required fields are element_id and template. Template will be
   automatically populated with a default template. This can be edited
   if needed.

* If the element is not currently on any pages, add it with a
  `<div data-secure-block-id="--YOUR ELEMENT ID--"></div>`

 * This will only work on templates loaded from seo_base.html

 * Currently, all testing is done on templates/CS_TEST_homepage_listing.html
   If you would like to edit and use this page for testing, ensure the
   configuration for your child site is set with the above as it's
   homepage

* Widget will populate on child site if the relationship was set up properly

secure-block-xx-xx.js
---------------------

Secure Blocks relies on the file secure-block-xx-xx.js file located in the
static directory. This file handles creating the ajax call based on the secure
block ids as well as populating the respective divs with the response.

**jQuery Data Attributes**:
jQuery Data attributes assigned to the same div as the data-secure-block-id div
will be sent to the secure blocks API in a dictionary form. Below is an example
of a webpage with one secure block named test that has data attributes email
and url.

.. code:: javascript

    {'test': {email:'test@example.com', url:'www.example.com'}}

The data attributes will then be available as context variables in the secure
blocks template.

.. note:: jQuery converts hyphens to camelCase when sending data attributes.
    The data attribute email-address would resolve in the secure block template
    as emailAddress. This does not affect underscores (email_address
    is email_address)

**Main Functions**

    **function load_secure_blocks(dashboard_url) { ... }**

        *Request secure blocks for all divs containing data-secure-block-id*

        :dashboard_url: The URL of the secure parent of the microsite


    **function reload_secure_block(block_id, callback) { ... }**

        *Request specific secure block to be reloaded*

        :block_id: Block to be reloaded

        :callback: Function to be called after ajax call completes successfully


Saved Search Widget
===================

The Saved Search widget is the first of the secure-blocks widgets to have
complex functionality. It incorporates Javascript, CSS, and HTML.

.. autoclass:: myblocks.models.SavedSearchWidgetBlock
    :members:

The appearance of the widget is largerly based on the template saved into the
model. There are template tags representing the various states that the widget
can be in.

As of this writing, the only javascript file used in the widget is
static/saved-search.js . This file contains the logic for calling the Saved
Search API and refreshing the