const fs = require("fs");
const path = require("path");
const express = require("express");
const combynExpress = require("combynexpress");

module.exports = function(server) {
  var port = process.env.PORT || 8000;
  var host = process.env.HOST;
  var staticDirs = ["lib", "dist", "themes", "node_modules"];
  var local = path.join.bind(path, __dirname);

  if (process.env.NODE_ENV === "production") {
    host = host || "127.0.0.1";

    // This is useful for testing, but will be overriden by NGINX in
    // production.
    staticDirs.forEach(function(name) {
      server.use("/" + name, express.static(path.resolve(name)));
    });
  }
  else if (process.env.NODE_ENV === "test") {
    host = host || "0.0.0.0";

    // Serve static files locally during development.
    staticDirs.forEach(function(name) {
      server.use("/" + name, express.static(path.resolve(name)));
    });

    process.on('uncaughtException', function(ex) {
      console.log('whatever');
    });
  }

  // Set the view engine.
  server.engine("html", combynExpress());
  server.set("view engine", "html");
  server.set("views", local("./templates"));

  // Listen server on the given port and host.
  if (port && host) {
    server.listen(port, host, function() {
      console.log("Listening on http://" + host + ":" + port);
    });
  }

  return server;
};
