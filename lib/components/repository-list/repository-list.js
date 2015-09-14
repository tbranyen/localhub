'use strict';

var WebApp = require('webapp');
var template = require('./repository-list.html');

var RepositoryListComponent = WebApp.View.extend({
  template: template,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
  },

  events: {
    'click .open': 'handleOpen'
  },

  handleOpen: function(ev) {
    ev.preventDefault();

    WebApp.$.get(ev.currentTarget.getAttribute('href'));
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

module.exports = RepositoryListComponent;
