define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var md5 = require('blueimp-md5');

  var RepositoryModel = WebApp.Model.extend({
    urlRoot: '/api/repositories',

    defaults: {
      commits: 0,
      notes: 0,
      tags: 0,
      commit: {
        message: '',
        author: {}
      },
    },

    message: function() {
      var commit = this.get('commit');

      if (!commit) {
        return 'No commit message';
      }

      return commit.message.split('\n')[0];
    },

    md5: function() {
      var commit = this.get('commit');

      if (!commit) {
        return '';
      }

      return md5(commit.author.email);
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
