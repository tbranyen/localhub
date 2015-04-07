define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var Commit = require('./commit');

  var RepositoryModel = WebApp.Model.extend({
    urlRoot: '/api/repositories',

    defaults: {
      branches: 0,
      commits: 0,
      notes: 0,
      tags: 0,
      name: '',
      readme: ''
    },

    idAttribute: 'repo',

    parse: function(resp) {
      // Normalize commits to models.
      if (resp.commit) {
        this.commit = Commit.Model.create(resp.commit, { parse: true });
      }

      return resp;
    },

    initialize: function() {
      this.commit = Commit.Model.create();
    }
  });

  var RepositoryCollection = WebApp.Collection.extend({
    model: RepositoryModel,
    url: '/api/repositories'
  });

  module.exports = {
    Model: RepositoryModel,
    Collection: RepositoryCollection
  };
});
