define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./commits.html');

  var Repository = require('../../resources/repository');
  var Commit = require('../../resources/commit');
  var CommitsList = require('../../components/commits-list/commits-list');

  var CommitsPage = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.collection = Commit.Collection.create();
      this.collection.repo = this.id;
      this.collection.branch = this.branch;
      this.collection.fetch();

      this.model = Repository.Model.create({ id: this.id });
      this.model.fetch();

      this.setView('.outlet', CommitsList.create({
        collection: this.collection
      }));

      this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.model, 'sync', this.render);
    },

    events: {
      'input .search': 'handleSearchInput'
    },

    afterRender: function() {
      var search = location.search.slice(1).split('&');

      search.forEach(function(item) {
        var parts = item.split('=');

        if (parts[0] === 'commits-search') {
          this.$('.search').val(parts[1]);
          this.handleSearchInput({ currentTarget: { value: parts[1] } });
        }
      }, this);
    },

    handleSearchInput: WebApp._.debounce(function(ev) {
      var commitsList = this.getView('.outlet');
      commitsList.searchTerm = ev.currentTarget.value.toLowerCase();
      commitsList.render();
    }, 150)
  });

  module.exports = CommitsPage;
});
