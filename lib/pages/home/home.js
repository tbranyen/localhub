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

    afterRender: function() {
      var search = location.search.slice(1).split('&');

      search.forEach(function(item) {
        var parts = item.split('=');

        if (parts[0] === 'home-search') {
          this.$('.search').val(parts[1]);
          this.handleSearchInput({ currentTarget: { value: parts[1] } });
        }
      }, this);
    },

    events: {
      'click .repo-list-item' : 'handleItemClick',
      'input .search': 'handleSearchInput',
      'click .sync': 'handleSync'
    },

    handleItemClick: function(ev) {
      ev.preventDefault();

      WebApp.history.navigate(
        this.$(ev.currentTarget).find('a').first().attr('href'), true);
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
