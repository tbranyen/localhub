define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./repository-list.html');

  var RepositoryListComponent = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.listenTo(this.collection, 'sync', this.render);
    },

    events: {
      'click .open': 'handleOpen',
      'click .select-folder': 'handleSelectFolder',
      'change input[type=file]': 'syncFolder'
    },

    syncFolder: function(ev) {
      ev.preventDefault();

      console.log(this.value);
    },

    handleSelectFolder: function(ev) {
      ev.preventDefault();

      this.$('input[type=file]').trigger('click').on('change', function() { alert('hello'); });
    },

    handleOpen: function(ev) {
      ev.preventDefault();

      WebApp.$.get(ev.currentTarget.getAttribute('href'));
    },

    serialize: function() {
      return this.collection.filter(function(repo) {
        if (this.searchTerm) {
          return repo.get('name').toLowerCase().indexOf(this.searchTerm) > -1;
        }

        return true;
      }, this);
    }
  });

  module.exports = RepositoryListComponent;
});
