const express = require('express');
const configure = require('./configure');
const api = require('./api');
const app = configure(express());

const RepositoryResource = require('./api/resources/repositories');

var repoList = null;

RepositoryResource.stack[0].handle({ method: 'GET' }, {
  json: function(out) {
    repoList = out;
  }
});

app.get('/', function(req, res) {
  res.render('pages/home');
});

app.use('/api', api);

// Enable pushState support.
app.use(function(req, res, next) {
  var match = false;

  // Return 404 for missing files inside of known static directories.
  app.staticFiles.forEach(function(file) {
    if (req.path.slice(1).indexOf(file) === 0) {
      match = true;
    }
  });

  if (match) { return next(); }

  res.locals.env = process.env.NODE_ENV;

  if (req.url.indexOf('repository') > -1) {
    res.render('pages/repository');
  }
  else {
    res.locals.repoList = function() { return repoList };
    res.render('pages/home');
  }
});
