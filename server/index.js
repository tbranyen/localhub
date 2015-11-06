const FalcorExpress = require('falcor-express');
const Falcor = require('falcor');
const express = require('express');
const configure = require('./configure');
const api = require('./api');
const LocalHubRouter = require('./falcor');
const indexRoutes = require('./routes/index');

var source = new LocalHubRouter();
var model = new Falcor.Model({ source });
var app = configure(express());

app.get('/', indexRoutes({ model }));

app.get('/repository', function(req, res) {
  res.render('pages/repository');
});

app.use('/api', api);
app.use('/api/falcor', FalcorExpress.dataSourceRoute(function() {
  return source;
}));

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
});
