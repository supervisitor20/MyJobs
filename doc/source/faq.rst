==========================
Frequently Asked Questions
==========================

Documentation
=============

Where is this hosted?
---------------------

This documentation is hosted directly on github using their ``gh-pages``
feature

How do I edit this documentation?
---------------------------------

How you edit this now and how it should be edited in the future are slightly
different.

Editing Now
-----------

Make changes under the ``doc`` directory on the ``sphinx`` branch like you
would any other Sphinx project, then run ``make ghpages`` from the ``doc``
directory. 

Editing in the Future
---------------------

We would add a post_commit hook that triggered ``make ghpages`` once something
was merged into the ``quality-control`` branch.

Why is it so ugly?
------------------

It's completely themable, so the current look is arbitrary.



