=====================
Job Posting Use Cases
=====================

.. note:: 
  - for simplicity, we use http://directemployers.jobs as our microsite.
  - for the same reason, we always use the `Admin` role, though any role with
    the correct activities should suffice

For your own purposes, you should change this URL to the one used by your
microsite.

Posting
=======
These use cases accommodate companies who want to post jobs to their own
microsite.

Use Case 1: External party buying a job
---------------------------------------
A small business owner (SBO) finds Paul's website. They decide to post a job,
so they create an account. This account is with paul's site, powered by
My.jobs. After creating an account, the SBO goes to the product listing and
purchases a product, 5 posting for 30 days, for $100. Paul receives an invoice
email that he can forward to the SBO. After purchasing the product, the SBO
goes to the purchased products page and posts a job. The job appears on the
site after approval.

Views
'''''

=================== ============= ===================
URL Path            View Name     Required Activities
=================== ============= ===================
/posting/all/       jobs_overview read job
/posting/job/add/   JobFormView   create job
/posting/job/update JobFormView   update job
=================== ============= ===================

Logging In
''''''''''

In order to access the above page, you must be able to log in, which implies
that the site being accessed should be associated with a login page.

Creating a login page can be done as follows:

From the Django shell
"""""""""""""""""""""
::

>>> from seo.models import *
>>> from myblocks.models import *
>>> site = SeoSite.objects.get(domain="directemployers.jobs")
>>> page = Page.objects.create(name="DirectEmployers Login Page", page_type=Page.LOGIN)
>>> page.sites.add(site)
>>> row = Row.objects.create()
>>> row_order = RowOrder.objects.create(row=row, page=page, order=0)
>>> login_block = LoginBlock.objects.create(name="DirectEmployers Login Block", offset=0, span=12")
>>> block_order = BlockOrder.objects.create(block=login_block, row=row, order=0)

From the Django admin
"""""""""""""""""""""

.. note:: Setting offset to 0 and span to 12 would have the effect of creating
          a content block which fills the width of its parent.

#. `create a new login block`_, ensuring to select an element id, offset, and
   span. 
#. `create a new row`_ and add your new login block to it. Be sure to assign an
   order to it, noting that indexes start at 0, not 1.
#. `create a new page`_ tied to the `SeoSite` you are working with, using
   'Login Page' as the page type. As with row, be sure to add an order.

Enabling Job Posting
''''''''''''''''''''

You should now be able to visit the `login page`_ for your microsite, but there
are still a few remaining step to be able to access the above page without
error. The remaining steps aren't as involved as those for creating a login
page. You need to:

  - associate a company with your microsite
  - give that company app-level access to posting
  - assign the user trying to access job posting a role with the correct
    permissions.

From the Django shell
"""""""""""""""""""""

Associate the company to the seo site::

>>> from seo.models import *
>>> company = Company.objects.get(name="DirectEmployers Association")
>>> site = SeoSite.objects.get(domain="directemployers.jobs")
>>> site.canonical_company = company
>>> site.save()

Enable Posting access for the company::

>>> from myjobs.models import *
>>> posting_access = AppAccess.objects.get(name="Posting")
>>> company.app_access.add(posting_access)

Associate the user to the company::

>>> role = company.role_set.get(name="Admin")
>>> user = User.objects.get(email="dev@apps.directemployers.org")
>>> user.roles.add(role)

From the Django Admin and User Management Tool
""""""""""""""""""""""""""""""""""""""""""""""

#. select the appropriate company as the ``canonical_company`` for 
   `your seo site`_.
#. `enable posting access` for the company chosen above by adding "Posting" to
   the "Chosen App-Level Access" box in teh "App-Level Access" section.
#. `assign your user a role` which has permission to post.
   .. note:: 
   At the moment, this must be done on https://secure.my.jobs as that is the
   only domain for which User Management is available. Be sure to change to
   the correct company in the topbar.

.. _create a new login block: http://directemployers.jobs/admin/myblocks/loginblock/add/
.. _create a new row: http://directemployers.jobs/admin/myblocks/row/add/
.. _create a new page: http://directemployers.jobs/admin/myblocks/page/
.. _login page: http://directemployers.jobs/login
.. _your seo site: http://directemployers.jobs/admin/seo/seosite/36815/?_changelist_filters=q%3Ddirectemployers.jobs
.. _enable posting access: http://directemployers.jobs/admin/seo/company/999999/?_changelist_filters=q%3Ddirectemployers%2Bass
.. _assign your user a role: https://secure.my.jobs/manage-users/#/users?_k=w22qot
