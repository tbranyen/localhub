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
    },

    handleFile: function(ev) {
      ev.preventDefault();
    },

    serialize: function() {
      if (!this.searchTerm) {
        return this.collection.models;
      }

      history.replaceState(null, null, '?home-search=' + this.searchTerm);

      return this.collection.filter(function(repo) {
        return repo.get('location').indexOf(this.searchTerm) > -1;
      }, this);
    }
  });

  module.exports = FileListComponent;
});
