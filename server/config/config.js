
let env = process.env.NODE_ENV

let config = require('./config.json');

module.exports = config[env]