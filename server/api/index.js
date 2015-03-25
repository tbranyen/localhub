var express = require('express');
var api = express();

var repositories = require('./resources/repositories');

api.use('/repositories', repositories);

module.exports = api;
