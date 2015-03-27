const fs = require('fs');
const path = require('path');
const express = require('express');
const combynExpress = require('combynexpress');

module.exports = function(server) {
  var port = process.env.PORT || 8000;
  var host = process.env.HOST;
  var local = path.join.bind(path, __dirname);

  server.staticFiles = [
    'package.json',
    'lib',
    'dist',
    'themes',
    'node_modules'
  ];

  if (process.env.NODE_ENV === 'production') {
    host = host || '127.0.0.1';
  }
  else if (process.env.NODE_ENV === 'test') {
    host = host || '127.0.0.1';
  }

  // Serve static files locally during development.
  server.staticFiles.forEach(function(name) {
    server.use('/' + name, express.static(path.resolve(name)));
  });

  // Set the view engine.
  server.engine('html', combynExpress());
  server.set('view engine', 'html');
  server.set('views', local('./templates'));

  // Listen server on the given port and host.
  if (port && host) {
    server.listen(port, host, function() {
      console.log('Listening on http://' + host + ':' + port);
    });
  }

  return server;
};
