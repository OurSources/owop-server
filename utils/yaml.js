'use strict';
const yaml = require(`js-yaml`);
const fs = require(`fs`);

function readYAML(fileName) {
	try {
		return yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
	} catch (e) {
		console.log(e);
	}
}

module.exports = { readYAML };
