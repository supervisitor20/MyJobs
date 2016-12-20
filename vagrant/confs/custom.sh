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
    npm install
}

function rebuilddev() {
    /home/web/virtualenvs/myjobs/bin/pip install -r /home/web/MyJobs/requirements.txt
}

