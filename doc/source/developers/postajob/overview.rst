Quick Start
===========

This section is designed to get you publishing and/or selling job postings
quickly. For a more detailed look at how the  various parts are related and
funtion, see the :ref:`product-life-cycle` section.

Posting Directly to a Microsite
-------------------------------

.. note:: 

  In the future, it will be possible to enable postajob access via the Django
  admin by visiting the "Companies" page and checking the appropriate app-level
  permission.

Enabling job posting for a single site is a three-step process:

  #. Enable posting access for the company who owns the microsite::

       >>> from seo.models import Company
       >>> company = Company.objects.get(name="Example Company")
       >>> company.posting_access = True
       >>> company.save()

  #. Ensure that the canonical company for the microsite is the same as the
     company above::

       >>> from seo.models import Company, SeoSite
       >>> company = Company.objects.get(name="Example Company")
       >>> site = SeoSite.objects.get(domain="example-company.com")
       >>> site.canonical_company = company
       >>> site.save()

  #. Verify access by visiting the job posting page on the microsite::

     $ firefox http://example-company.com/posting/all

Selling Job Postings to Others
------------------------------

.. todo::

  - Determine the need for explicit site-package creation steps.
  
  - Update these instructions when Roles are released

Enabling the selling of jobs to other microsites is only sligtly more
complicated, and is a four-step process:

  #. Enable product access for the company who will be selling job postings::

       >>> from seo.models import Company
       >>> company = Company.objects.get(name="Example Company")
       >>> company.product_access = True
       >>> company.save()

  #. Create a site package for the company, which will determine on which
     domains the sold jobs appear.

  #. Create an ``seo.CompanyUser`` for each user who needs to be able to manage
     these postings.

  #. Verify access by visiting the posting admin page::

       $ firefox http://example-company.com/posting/admin

.. _product-life-cycle:

Product Life Cycle
==================
A product transitions between different states throughout its life time, and
depending on that state may be interacted with in a few different ways,
depending on the user's role. What follows is a complete description of that
life cycle broken down by a user's role.

Purchased Microsite Owner
-------------------------
A purchased microsite owner can create and sell products as well as moderate
the use of those products. Before doing so, they must first have a site-package
to add that product to. Currently, requests for site-packages are fielded by
DirectEmployers staff. After fulfilling the site-package requirement, the
process of selling and managing products is pretty straight forward.

Product Creation
~~~~~~~~~~~~~~~~
.. note:: Pricing a product requires that a purchased microsite owner have an
          Authorize.net account.

Creating a product is simply a matter of deciding which site-package it is
a part of, determining which company it belongs to, the price of the
product, and various details about the types of jobs that can be created
with the product.  If a purchased microsite owner wants finer grained
control over which jobs may be posted, they should ensure that the product
requires approval. 

Product Groupings [#]_
~~~~~~~~~~~~~~~~~~~~~~
In order for products to be visible for a user, they must first be a part of a
product grouping. In the simplest case, a product grouping will consist of a
single product, but they may be leveraged to prioritize and organize products.
For instance, it is entirely reasonable to create a "Featured Products" product
grouping.

Offline Purchase
~~~~~~~~~~~~~~~~
An offline purchase represents an order that may or may not have been
fulfilled. If a purchasing company is specified, then the selected products
will appear in that company's purchased products list. If a purchasing company
is not specified, the offline purchase's redemption code may be used later to
claim the purchase.

Job Posting Requests
~~~~~~~~~~~~~~~~~~~~
By this point, a user now has the ability to post jobs using their purchased
products. Each job posting that is moderated may be accepted, rejected, or in
cases where it is deemed necessary, the company can be blocked from creating
future postings. If a moderated job is later edited, it will be sent for review
again before being published. 

Unaffiliated User
-----------------
An unaffiliated user may purchase products which given them access to one or
more job postings. Those job postings may or may not have an expiration date,
require approval on submission, and may be edited or deleted as necessary.

Product Purchase
~~~~~~~~~~~~~~~~
In order to purchase a product, a user must either belong to a company which is
recognized as a customer of the product owner, or they must manually enter a
redemption code for a purchase negotiated outside of the posted jobs framework.

Job Posting
~~~~~~~~~~~
Each purchased product has a number of job listings which will appear on the
product's sites. A job posting may have multiple locations, special
instructions for applicants, and an expiration date [#]_. 

Waiting for Approval
~~~~~~~~~~~~~~~~~~~~
If that product requires approval, a job posting may be rejected, in which
case, the poster will be notified of the reasons and may attempt to re-submit
the posting. It is also within the product owner's discretion to revoke a
company user's permission to create any job postings, in which case that user
will be notified as well.

Editing Job Postings
~~~~~~~~~~~~~~~~~~~~
Once a job posting is published, a user may later edit (eg. to correct typos)
or delete (eg. once the position is filled) it. It should be noted that a
moderated job that has been re-submitted will have to be re-approved. 

.. [#] Future versions of this feature will deprecate the use of product
       groupings, which should streamline the entire process.

.. [#] The product may have a maximum expiration (eg. 30 days), which may not be
       exceeded.
