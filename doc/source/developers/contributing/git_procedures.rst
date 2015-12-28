=================
GitHub Procedures
=================

Creating a PR
=============

When creating a PR on GitHub, be sure to add the JIRA ticket number in the
title. This allows JIRA to track the progress of the ticket and keep the
reporter/watches updated. Titles should be in the following format:
**[PD-9999] GitHub Ticket Description**


In the summary section, write a brief but thorough explanation of the purpose
of the ticket and any design decisions made. Be sure to include any steps
needed in order to test the PR.

`Example of a Well Written Summary`_

.. _Example of a Well Written Summary: https://github.com/DirectEmployers/MyJobs/pull/1874

It is also very helpful to annotate individual changes in the PR. This is
especially true when dealing with confusing logic or controversial changes.

`Example of Well Written Annotations`_

.. _Example of Well Written Annotations: https://github.com/DirectEmployers/MyJobs/pull/1983/files

PRs are meant to represent code you are either intending to be committed to
QC, or desire specific input on (see Requesting Help). If neither of these apply,
please close the PR.


Requesting Help / WIP / Input from team
=======================================

If you have a bit of code that is giving you trouble, or would like input
from another team member on something you have written, open a
"Guidance Requested" PR in GitHub.

* Push your branch to GitHub
* Open a PR with the label "Guidance Requested"
* In the summary, write a bit about the help needed
* If you want help from someone specific, tag them with "@"
* Close the PR once you have received the input desired