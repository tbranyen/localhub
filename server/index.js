const express = require('express');
const configure = require('./configure');
const api = require('./api');
const app = configure(express());

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

  res.render('pages/home');
});
