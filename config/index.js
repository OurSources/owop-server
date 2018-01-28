'use strict';
const yaml = require(`../utils/yaml.js`);

module.exports = yaml.readYAML(`config/config.yaml`);

console.log(`Loaded config`);