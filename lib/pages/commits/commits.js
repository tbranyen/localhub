define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var timelinejs = require('timelinejs');
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
      var timelineData = this.collection.map(function(model) {
        var commit = model.attributes;

        return {
          startDate: commit.timeline,
          endDate: commit.timeline,
          headline: commit.message.slice(0, 24),
          text: 'authored on ' + commit.date,
          asset: {
            thumbnail: "http://www.gravatar.com/avatar/" + model.hash
          }
        };
      });

      if (this.collection.length) {
        createStoryJS({
          type: 'timeline',
          width: '100%',
          height: '200',
          start_zoom_adjust: -3,
          start_at_end: true,
          source: {
            timeline: {
              type: "default",
              text: "",
              date: timelineData
            }
          },

          embed_id: 'commit_timeline'
        });
      }

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
