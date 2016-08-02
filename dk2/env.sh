dk() {
    time sh dk2/dockerdev.sh "$@"
}

dkm() {
    dk -P settings_myjobs manage "$@"
}

dkr() {
    dk -P settings_myjobs:. dorun "$@"
}

dkg() {
    dk -p 8080 doruncd gulp "$@"
}

dkgg() {
    dkg nodejs node_modules/.bin/gulp "$@"
}

