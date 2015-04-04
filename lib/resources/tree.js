define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');

  var TreeModel = WebApp.Model.extend({
  });

  var TreeCollection = WebApp.Collection.extend({
    model: TreeModel,

    url: function() {
      return [
        '/api/repositories',
        this.repo.id,
        this.repo.get('branch'),
        'tree',
        this.path
      ].join('/');
    }
  });

  module.exports = {
    Model: TreeModel,
    Collection: TreeCollection
  };
});
