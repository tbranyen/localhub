define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./file-blob.html');

  var FileBlobComponent = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
    },

    beforeRender: function() {
      return Boolean(this.model.get('blob'));
    }
  });

  module.exports = FileBlobComponent;
});
