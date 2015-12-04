==============================================
Frequently Asked Questions About Documentation
==============================================

Where is This Hosted?
=====================
This documentation is hosted directy on github using their ghpages feature

How do I edit this documentation?
=================================

How you edit this now and how it should be edited in the future are slightly
different.

Editing Now
-----------
Make changes under the `doc` directory on the `sphinx` branch like you would
any other Sphinx project, then run `make ghpages` from the `doc` directory. 

Editing in the Future
---------------------
Ideally, Jenkins would takek care of the `make ghpages` step. All that then
remains is to either. Then it would simply be a matter of opening a pull
request against the `quality-control` branch which would be what the Makefile
checks instead of `sphinx`. 

Why is it so ugly?
==================
It's completely themable, so the current look is arbitrary.



