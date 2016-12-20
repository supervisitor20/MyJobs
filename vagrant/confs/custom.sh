export DEVSERVER_HTTPS=true

function runsecure() {
    cd /home/web/MyJobs/
    /home/web/virtualenvs/myjobs/bin/python manage.py runserver 0.0.0.0:8000 --settings=myjobs_settings
}

function runmicrosites() {
    cd /home/web/MyJobs/
    /home/web/virtualenvs/myjobs/bin/python manage.py runserver 0.0.0.0:8001 --settings=dseo_settings
}

function runjs() {
    cd /home/web/MyJobs/gulp
    npm run devserver
}

function rebuildjs() {
    cd /home/web/MyJobs/gulp
    if [ -d "node_modules" ]; then
      sudo rm -rf node_modules
    fi
    npm install
}

function rebuildvenv() {
    if [ -d "/home/web/virtualenvs/myjobs" ]; then
      sudo rm -rf /home/web/virtualenvs/myjobs
    fi
    /home/web/virtualenvs/myjobs/bin/pip install -r /home/web/MyJobs/requirements.txt
}

function rebuilddev() {
    rebuildjs
    rebuildvenv
}
