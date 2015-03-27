define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var md5 = require('blueimp-md5');

  var CommitModel = WebApp.Model.extend({
    defaults: {
      message: 'No commit message',
      author: {}
    },

    parse: function(resp) {
      this.oneline = resp.message.split('\n')[0];
      this.hash = md5(resp.author.email);

      return resp;
    }
  });

  var CommitCollection = WebApp.Collection.extend({
    model: CommitModel,
    url: function() {
      return [
        '/api/repositories', this.repo, this.branch, 'commits'
      ].join('/');
    }
  });

  module.exports = {
    Model: CommitModel,
    Collection: CommitCollection
  };
});
