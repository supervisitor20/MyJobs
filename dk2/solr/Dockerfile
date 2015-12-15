from ubuntu:14.10

env DEBIAN_FRONTEND=noninteractive

run apt-get --yes install wget
run wget --quiet http://archive.apache.org/dist/lucene/solr/5.1.0/solr-5.1.0.tgz
run apt-get update
run apt-cache search openjdk8
run apt-get --yes install unzip openjdk-8-jre-headless

# Solr

run tar xvf solr-5.1.0.tgz solr-5.1.0/bin/install_solr_service.sh --strip-components=2
run sed '/ERROR: Your Linux distribution/!b;n;ctrue' -i install_solr_service.sh

run bash ./install_solr_service.sh solr-5.1.0.tgz
run mv /var/solr/data/solr.xml /var/solr

volume /var/solr/data

expose 8983
env SOLR_INCLUDE /var/solr/solr.in.sh
cmd /opt/solr/bin/solr -f
