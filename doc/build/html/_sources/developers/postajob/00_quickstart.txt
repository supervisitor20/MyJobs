===========
Quick Start
===========

This section is designed to get you publishing and/or selling job postings
quickly. For a more detailed look at how the  various parts are related and
funtion, see the :ref:`product-life-cycle`.

Posting Directly to a Microsite
===============================

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
==============================

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


