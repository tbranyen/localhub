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

      var handleScroll = WebApp._.throttle(this.handleScroll.bind(this), 250);

      // Only want one scroll event.
      window.onscroll = handleScroll;

      this.markers = [];
      this.max = 1000;
    },

    events: {
      'input .search': 'handleSearchInput',
      'mouseenter .commit_item': 'handleHover'
    },

    handleHover: function(ev) {
      // FIXME Figure out how to know when timeline is done initializing.
      if (!this.markers.length) {
        this.markers = this.$('#storyjs-timeline').find('.content .marker');
      }

      var index = $(ev.currentTarget).index();
      var marker = this.markers.eq(this.markers.length - index - 1);

      marker.find('.flag').trigger('click');
    },

    handleScroll: function(ev) {
      if (!this.markers.length) {
        this.markers = this.$('#storyjs-timeline').find('.content .marker');
      }

      var findElement = document.elementFromPoint($(window).width() / 2, 320);

      // Cache the markers.
      var index = $(findElement).parents('.commit_item').index();
      var marker = this.markers.eq(this.markers.length - index - 1);

      marker.find('.flag').trigger('click');
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

      if (!this.storyInit && timelineData > 0 && timelineData < this.max) {
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

        this.storyInit = true;
      }

      if (this.collection.length > this.max) {
        this.$('#commit_timeline')
          .html('<h3>Sorry, too many commits to display timeline.</h3>' +
            '<p>Currently investigating ways to improve performance.</p>');
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
