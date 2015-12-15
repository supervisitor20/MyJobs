===========================================
Setting Up and Using Docker for Development
===========================================


What to Expect
==============

* Creates a known good working environment.

* Creates a local reverse proxy which is able to serve microsites in a manner
  consistent with production, including http vs. https handling.

* There will be permissions issues. The user running tools in the docker
  container will not have the same uid as the developer's own uid. This will
  result in occasional problems. This tends to affect pyc files, (not a big
  deal) and node_modules (occasionally annoying).

What you Need
=============

* MyJobs should be checked out.
* A development database backup to restore.
* An archive of a working Solr configuration.
* Django secrets files, settings files, and a dev_settings file.
* All the needed files should be sitting in the MyJobs directory.

Getting Docker and the MyJobs Convenience Aliases Working
=========================================================

Our goal here is to get Docker installed and our shell aliases working.

First Time (OSX)
----------------

Install `Docker Toolbox <https://www.docker.com/docker-toolbox>`_.
1.9.1b is known to work

Run the terminal which the installer offers after the install completes.
(This creates the default virtual machine.)

Run ``docker ps`` in this terminal. It should run without errors.

Run ``docker-machine ip default``. Note this ip. We'll call it $myip from now
on.

After Boot (OSX)
----------------

Run ``docker-machine start default``. This will be needed after every reboot.

First Time (Linux)
------------------

Install docker from your distro.

Know your local ip address. We'll call it $myip from now on.

Terminal Setup (OSX)
--------------------

Run these commands in every shell:

``eval "$(docker-machine env default)"``

Terminal Setup (Both)
---------------------

``cd $myjobs`` where myjobs is wherever you checked out the MyJobs code.

``. dk2/env.sh`` This makes the ``dk`` convenience function available.

Build the Development Image
===========================

Rerun this any time we change requirements.txt.

``(cd dk2/dev && ln -s ../../requirements.txt .)`` Need this symlink.

``dk rebuilddev`` Also takes a long time.

Build the Background Containers
===============================

MyJobs needs solr, and mysql, and we will also set up a reverse proxy here.

From the MyJobs directory and with ``dk2/env.sh`` sourced:

``dk pull`` Takes a long time. Downloads some Docker images for local use.

``export MYSQL_ROOT_PASSWORD="somepassword"`` This should only be needed when
running mysql for the first time.

``dk background`` First run takes a long time.

``dk backgroundstop`` If you have problems here, restart docker itself or the
docker virtual machine.

If needed on Linux: ``systemctl restart docker``

If needed on OSX: ``docker-machine restart default``

Keep trying until ``docker ps`` shows no running machines.

Load Data into MySql and Solr
=============================

``dk background`` At this point possibly only MySql will stay running.

``dk maint mysql:5.5`` Start an interactive container based on MySql

``cp -a solr_config/* /var/solr/data`` assuming you have ``solr.xml`` and
friends in ``solr_config/``

``mysql -u root -p -h $myip``

``mysql> SET GLOBAL max_allowed_packet=1073741824;``

``exit``

``mysql -u root -p -h $myip <dbbackup.sql`` assuming that your database backup
file is ``dbbackup.sql``

``exit`` Exits the interactive container.

``dk backgroundstop``

``docker ps`` Verify no running containers.

``dk background``

``docker ps`` Should show mysql, solr, and revproxy running.

Configure MyJobs to Run in Docker Containers
============================================

Appropriate settings, obtained from other developers, go in these files:

* ``secrets.py``

* ``settings_myjobs/settings.py``

* ``settings_dseo/settings.py``

* ``dev_settings.py``

Verify that Django Works
========================

``dkm test myjobs`` same as ``python manage.py test myjobs``.

Run Django Containers
=====================

We run these services in the interactively in the foreground as it's convenient
to have instant scrollable/searchable access to their logs.

Start a new terminal.

``dk runsecure``

Start a new terminal

``dk runmicrosites``

