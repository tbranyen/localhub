const fs = require('fs');
const path = require('path');
const express = require('express');
const combynExpress = require('combynexpress');
const livereload = require('express-livereload');

var local = path.join.bind(path, __dirname);

module.exports = function(server) {
  var port = process.env.PORT;
  var host = process.env.HOST;
  var env = process.env.NODE_ENV || 'test';

  server.staticFiles = [
    'package.json',
    'client',
    'dist',
    'views',
    'themes',
    'node_modules'
  ];

  if (env === 'production') {
    host = host || '127.0.0.1';
    port = port || 80;
  }
  else if (env === 'test') {
    host = host || '127.0.0.1';
    port = port || 8000;

    livereload(server, { watchDir: [local('../dist/')] });
  }

  // Serve static files locally during development.
  server.staticFiles.forEach(function(name) {
    server.use('/' + name, express.static(path.resolve(name)));
  });

  // Set the view engine.
  server.engine('html', combynExpress());
  server.set('view engine', 'html');

  // Listen server on the given port and host.
  if (port && host) {
    server.listen(port, host, function(err) {
      console.log('Listening on http://' + host + ':' + port);
    });
  }

  return server;
};
