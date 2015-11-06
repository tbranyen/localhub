'use strict';

var WebApp = require('webapp');

var RepositoryListComponent = WebApp.View.extend({
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
      return this.collection.toJSON();
    }

    history.replaceState(null, null, '?q=' + this.searchTerm);

    return this.collection.filter(function(repo) {
      return repo.get('location').toLowerCase().indexOf(this.searchTerm) > -1;
    }, this);
  }
});

module.exports = RepositoryListComponent;
