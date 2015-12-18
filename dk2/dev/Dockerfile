from ubuntu:14.04

env DEBIAN_FRONTEND=noninteractive

run apt-get update
run apt-get --yes build-dep python-mysqldb libgeos-dev && apt-get clean
run apt-get --yes install python-setuptools python-dev apache2 python-pip \
    mysql-client libxml2 libxml2-dev libxslt-dev python-mysqldb npm \
    phantomjs python-ipdb strace && apt-get clean

# Node.js

run update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
run npm install -g graceful-fs@2.0.1 less@1.6.1

# My.Jobs

run apt-get --yes install git-core inotify-tools

add requirements.txt /requirements.txt
run pip install -r requirements.txt
run pip install django-debug-toolbar sphinx

run adduser dev

run mkdir -p /var/log/directseo /var/log/myjobs /home/web/myjobslogs
run touch /var/log/directseo/dseo.log /home/web/myjobslogs/logfile
run ln -s /var/log /log

volume /MyJobs
volume /deployment
