var express = require('express');
var configure = require('./configure');
var api = require('./api');
var app = configure(express());

app.get('/', function(req, res) {
  res.render('index');
});

app.use('/api', api);
