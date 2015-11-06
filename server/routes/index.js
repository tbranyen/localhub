const express = require('express');

var filter = Array.prototype.filter;

module.exports = function(opts) {
  var model = opts.model;
  var router = express.Router();

  router.get('/', function(req, res) {
    model.get('repositories[0..500]["name", "id", "location"]')
      .then(function(resp) {
        var repositories = resp.json.repositories;
        repositories.length = Object.keys(repositories).length - 1;

        res.locals.searchTerm = req.query.q;

        res.locals.repositories = filter.call(repositories, function(repo) {
          var lowerLocation = repo.location.toLowerCase();
          return req.query.q ? lowerLocation.indexOf(req.query.q) > -1 : true;
        });

        res.render('pages/home');

        return resp.json.repositories;
      })
      .catch(console.log);
  });

  return router;
};
