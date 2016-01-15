# Updating Dependencies

If you update dependencies in `package.json`, take care to make sure the
`npm-shrinkwrap.json` file is consistent.

To add or upgrade a package use:

    npm install --save-dev $packagename
    npm install --save-dev $packagename@$version

This will keep `npm-shrinkwrap.json` and `package.json` consistent.

If you edit package.json directly you may find you need to:

    rm -rf node_modules npm-shrinkwrap.json
    npm install
    npm shrinkwrap --dev

Then verify that the changes in `npm-shrinkwrap.json` are acceptable.
