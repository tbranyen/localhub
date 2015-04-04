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
      'click .directory': 'handleDirectory'
    },

    handleDirectory: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      var directory = this.$(ev.currentTarget).data('path');
      this.collection.path = directory;
      this.collection.fetch({ reset: true });

      WebApp.history.navigate([
        'repository',
        this.collection.repo.id,
        this.collection.repo.get('branch'),
        'tree',
        directory
      ].join('/'));
    },

    handleFile: function(ev) {
      ev.preventDefault();
    },

    beforeRender: function() {
      return Boolean(this.collection.length);
    }
  });

  module.exports = FileListComponent;
});
