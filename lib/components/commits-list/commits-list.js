'use strict';

var WebApp = require('webapp');
var template = require('./commits-list.html');

var CommitListComponent = WebApp.View.extend({
  template: template,

  initialize: function() {
    this.listenTo(this.collection, 'sync', this.render);
  },

  serialize: function() {
    if (!this.searchTerm) {
      return this.collection.models;
    }

    var termLower = this.searchTerm.toLowerCase();

    return this.collection.filter(function(commit) {
      return commit.attributes.message.toLowerCase().indexOf(termLower) > -1;
    }, this);
  }
});

module.exports = CommitListComponent;
