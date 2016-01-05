==========================
Frequently Asked Questions
==========================

User Management
===============

.. glossary::

  I'm trying to access PRM; Why do I get a 404?
    You need to be assigned a role for the company whose PRM instance you are
    trying to access.

  I've assigned myself a role to a company, so why do I still get a 403 when
  attempting to Access PRM?
    You should ensure that the company has PRM app-level access

  The company I'm attempting to access has PRM app-level access, so why do I
  still get a 403 when trying to access PRM?
    In addition to the company needing to have app-level access for the app
    which you are trying to access, the role assigned to the user needs to have
    activities required for that particular app's page. In the case of the PRM
    overview page, a role must include the "read partner" activity.

  I think I'm having an existential crisis. I don't have permissions to assign
  roles, so how would I be assigned a role with the "read partner" activity?
    It is assumed that someone for the company already exists as an admin who
    can assign that role for you. If not, you'll need to assign yourself as an
    Admin from the console.

  How do I assign roles in the Django Admin?
    You don't. That was a design decision to discourage employees from managing
    users on behalf of the member. Assigning roles should be done from the
    ``User Management`` option found under ``Employer`` in the topbar.

  Why don't I see "User Management" in the topbar?
    First, roles should be enabled by adding ``ROLES_ENABLED = True`` in your
    Django settings file. Second, the company for which you'd like to manage
    users should have "User Management" app-level access. Finally, the user
    attempting to manage users should be assigned a role which has the "read
    role" activity.

  How do I add app-level access?
    If you navigate to "Companies" in the Django admin (under "Common Tasks")
    and select a company, you should see a section called "App-Level Access"
    near the top. Note that it could take a moment for the page to load.

  I'm already a CompanyUser, so why don't I have an "Employer" menu?
    Because you don't have permission to access anything that would show up in
    the employer menu. With roles enabled, CompanyUser means absolutely
    nothing. It's only reason for existing is to support the old system, which
    is still in use in production.


Documentation
=============

.. glossary::

  Where is this hosted?
    This documentation is hosted directly on GitHub using their ``gh-pages``
    feature

  How do I edit this documentation?
    How you edit this now and how it should be edited in the future are
    slightly different.

  How do I edit this document *now*?
    Make changes under the ``doc`` directory on the ``sphinx`` branch like you
    would any other Sphinx project, then run ``make ghpages`` from the ``doc``
    directory. 

  How will I edit this document in the future?
    We would add a post_commit hook that triggered ``make ghpages`` once
    something was merged into the ``quality-control`` branch.

  Why is it so ugly?
    It's completely themeable, so the current look is arbitrary.