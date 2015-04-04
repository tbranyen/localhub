define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');

  var FileModel = WebApp.Model.extend({
    url: function() {
      return [
        '/api/repositories',
        this.repo.id,
        this.repo.get('branch'),
        'blob',
        this.path
      ].join('/');
    }
  });

  module.exports = {
    Model: FileModel
  };
});
