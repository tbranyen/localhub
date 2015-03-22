var promisify = require('promisify-node');
var express = require('express');
var configure = require('./configure');
var api = configure(express());

api.get('/', function(req, res) {
  res.render('index');
});

api.get('/repositories', function(req, res) {
  
});
