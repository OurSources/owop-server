'use strict';

const yaml = require(`js-yaml`);

function readYAML(fileName) {
    try {
        return yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
    } catch (e) {
        console.log(e);
    }
}

module.exports = { readYAML };