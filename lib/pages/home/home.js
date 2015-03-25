define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./home.html');

  var Repository = require('../../resources/repository');
  var RepoList = require('../../components/repository-list/repository-list');

  var HomePage = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.collection = Repository.Collection.create();
      this.collection.fetch();

      this.setView('.outlet', RepoList.create({
        collection: this.collection
      }));

      this.listenTo(this.collection, 'sync', this.render);
    },

    events: {
      'input input': 'handleSearchInput',
      'click .sync': 'handleSync'
    },

    handleSync: function(ev) {
      var button = this.$(ev.currentTarget);
      var collection = this.collection;

      button.attr('disabled', 'disabled');
      button.addClass('pending');

      WebApp.$.getJSON('/api/repositories/sync', function() {
        button.removeAttr('disabled');
        button.removeClass('pending');

        collection.fetch();
      });
    },

    handleSearchInput: WebApp._.debounce(function(ev) {
      var repoList = this.getView('.outlet');
      repoList.searchTerm = ev.currentTarget.value.toLowerCase();
      repoList.render();
      this.$('.count').text(repoList.serialize().length);
    }, 150)
  });

  module.exports = HomePage;
});
