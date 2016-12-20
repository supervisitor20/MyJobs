Overview
--------

Vagrant, with just a few commands and a little bit of waiting, will provide a VM capable of running the MyJobs platform.


This VM will be running at the IP address 192.168.33.11. It's recommended that you add the following entry in your hosts file to account for this:

`192.168.33.11	secure.my.jobs www.my.jobs my.jobs indianapolis.jobs directemployers.jobs`


Defaults
--------
The following are the default usernames and passwords configured:
* OS (passwordless sudo is configured, so this should not be needed):
    * username: `vagrant`
    * password: `vagrant`
* MySQL:
    * username: `root`
    * password: `password`


Required Directory Structure
----------------------------

    ├── /MyJobs
    |   ├── /...
    |   ├── /vagrant
    |   ├── /dseo_settings.py
    |   ├── /myjobs_settings.py
    |   └── /....
    ├── /deployment
    |   ├── /...
    |   └── /search
    |   |    └── /solr
    |   |       └── /conf
    |   |           └── /protowords.xml
    |   |           └── /schema.xml
    |   |           └── /solrconfig.xml
    |   |           └── /stopwords.txt
    |   |           └── /stopwords_en.txt
    |   |           └── /synonyms.txt
    |   |           └── /tagwords.txt
    |   └── /...
    ├── /virtualenvs
    |   └── /myjobs

In order for the custom bash commands to work dseo_settings.py and myjobs_settings.py need to be placed as specified.

Note: The virtualenvs directory is recommended but not required.


Set Up
------
1. Navigate to the MyJobs/vagrant directory via command line.
2. Type `vagrant up`. This will take a long time the the first time you use this command to provision a new VM. The very first time you run it, the command will take even longer because the VM base has to be downloaded from the internet. It will be stored locally for each `vagrant up` afterward.
3. Type `vagrant ssh`.


Useful Vagrant Commands
-----------------------
* `vagrant up` - Create and provision an instance of this VM. You can only have one instance of the VM at a time, so if you already have one instance this will not create a second.
* `vagrant ssh` - SSHs into the running VM.
* `vagrant destroy -f` - Removes the VM you're currently working with. Good when you've messed something up and want to fix it.
* `vagrant halt` - Stops the VM.
* `vagrant resume` - Stops the halted VM. Technically `vagrant up` can accomplish the same goal.
* `vagrant reload` - Restarts the VM.

Useful Commands Inside the VM
-----------------------------
Note: If you don't have access to these commands, it's because your VM hasn't been restarted for the first time yet. In this case you can use `source /etc/profile.d/custom.sh` to get access to these commands.

* `runsecure` - Runs MyJobs on port 8000.
* `runmicrosites` - Runs Microsites on port 8001.
* `runjs` - Runs the JS server on port 8080.