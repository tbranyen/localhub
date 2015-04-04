define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./file-list.html');

  var FileListComponent = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.listenTo(this.collection, 'sync', this.render);
    },

    events: {
      'click .directory': 'handleDirectory',
      'click .file': 'handleFile',
    },

    handleDirectory: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      var directory = this.$(ev.currentTarget).data('path');
      this.collection.path = directory;
      this.collection.fetch({ reset: true });
    },

    handleFile: function(ev) {
      ev.preventDefault();
    }
  });

  module.exports = FileListComponent;
});
