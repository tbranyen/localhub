'use strict';

import WebApp from 'webapp';
import { $ } from 'webapp';
import template from './commits.html';

import Repository from '../../resources/repository';
import { CommitCollection } from '../../resources/commit';
import CommitsList from '../../components/commits-list/commits-list';

var CommitsPage = WebApp.View.extend({
  template: template,

  initialize: function() {
    this.collection = CommitCollection.create();
    this.collection.repo = this.repo;
    this.collection.branch = this.branch;
    this.collection.fetch();

    this.model = Repository.Model.create({ repo: this.repo });
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

    var commit = $(ev.currentTarget);
    var lookupSha = commit.find('.sha').data('full');

    this.markers.each(function() {
      var marker = $(this);
      var sha = marker.find('h3').text().split(' ').pop();

      if (sha === lookupSha) {
        marker.find('.flag').trigger('click');
      }
    });
  },

  handleScroll: function(ev) {
    if (!this.markers.length) {
      this.markers = this.$('#storyjs-timeline').find('.content .marker');
    }

    var findElement = document.elementFromPoint($(window).width() / 2, 320);

    // Cache the markers.
    var commit = $(findElement).parents('.commit_item');
    var lookupSha = commit.find('.sha').data('full');

    this.markers.each(function() {
      var marker = $(this);
      var sha = marker.find('h3').text().split(' ').pop();

      if (sha === lookupSha) {
        marker.find('.flag').trigger('click');
      }
    });
  },

  afterRender: function() {
    var timelineData = this.collection.map(function(model) {
      var commit = model.attributes;

      return {
        startDate: commit.timeline,
        endDate: commit.timeline,
        headline: commit.message + ' ' + commit.sha,
        asset: {
          thumbnail: 'http://www.gravatar.com/avatar/' + model.hash
        }
      };
    });

    //if (!this.storyInit && timelineData.length > 0 && timelineData.length < this.max) {
    //  createStoryJS({
    //    type: 'timeline',
    //    width: '100%',
    //    height: '200',
    //    start_zoom_adjust: -3,
    //    start_at_end: true,
    //    source: {
    //      timeline: {
    //        type: 'default',
    //        text: '',
    //        date: timelineData,
    //        era: [{
    //          startDate: '2011,12,10',
    //          endDate: '2011,12,11',
    //          headline: 'Headline Goes Here'
    //        }]
    //      }
    //    },

    //    embed_id: 'commit_timeline'
    //  });

    //  this.storyInit = true;
    //}

    //if (this.collection.length > this.max) {
      this.$('#commit_timeline').hide()
        .html('<h3>Sorry, too many commits to display timeline.</h3>' +
          '<p>Currently investigating ways to improve performance.</p>');
    //}

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
