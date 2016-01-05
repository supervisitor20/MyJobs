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

Preparation
=============

* Clone MyJobs repo.
* Add these to the root of the repo (get from another developer):

  * Permanently:

    * Settings.py

    * Dev_settings.py

    * Secrets.py

  * Temporarily:

    * Dump of development MySQL database (named dbbackup.sql). For example:

      ```
      mysqldump -u root -p db > dbbackup.sql;
      ```

      If you make a dump from a newer version of MySQL than what is in production
      you're going to have a bad time.

    * An archive of a working Solr configuration. For example:

      ```
      cp -r /usr/local/Cellar/solr/5.3.1/server/solr ~/projects/MyJobs
      ```

      If you make a dump from a newer version of Solr than what is in production
      you're going to have a bad time.

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

Initialize the Data Volumes and Certs
=====================================

This sets aside some volumes which will not be deleted when containers are
removed.

It also initializes some self signed ssl certificates for the reverse proxy.

``dk init``

Build the Development Image
===========================

Rerun this any time we change requirements.txt.

``(cd dk2/dev && ln -s ../../requirements.txt .)`` Need this symlink.

``dk rebuilddev`` Also takes a long time. [If it hits a glitch run this command again]

Build the Background Containers
===============================

MyJobs needs Solr, and MySQL, and we will also set up a reverse proxy here.

From the MyJobs directory and with ``dk2/env.sh`` sourced:

``dk pull`` Takes a long time. Downloads some Docker images for local use.

``export MYSQL_ROOT_PASSWORD="somepassword"`` This should only be needed when
running MySQL for the first time.

``dk background`` First run takes a long time.

``dk backgroundstop`` If you have problems here, restart docker itself or the
docker virtual machine.

If needed on Linux: ``systemctl restart docker``

If needed on OSX: ``docker-machine restart default``

Keep trying until ``docker ps`` shows no running machines.

Load Data into MySQL and Solr
=============================

``dk background`` At this point possibly only MySql will stay running.

``dk maint mysql:5.5`` Start an interactive container based on MySQL

``cp -a solr_config/* /var/solr/data`` assuming you have ``solr.xml`` and
friends in ``solr_config/``

``mysql -u root -p -h $myip``

``mysql> SET GLOBAL max_allowed_packet=1073741824;``

``exit``

``mysql -u root -p -h $myip db <dbbackup.sql`` assuming that your database
backup file is ``dbbackup.sql``

``exit`` Exits the interactive container.

``dk backgroundstop``

``docker ps`` Verify no running containers.

``dk background``

``docker ps`` Should show MySQL, Solr, and revproxy running.

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

Access Local Containers with a Browser
======================================

Add to ``/etc/hosts``:

``$myip secure.my.jobs www.my.jobs``

Add other microsites as needed.

Go to http://secure.my.jobs. You should have to click through a security
warning.