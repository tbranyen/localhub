'use strict';

import WebApp from 'webapp';
import { $, _ } from 'webapp';

import Page from '../page';
import Repository from '../../resources/repository';
import RepoList from '../../components/repository-list/repository-list';
import template from '../../../views/pages/home.html';

export default class HomePage extends Page.extend({
  template,

  events: {
    'click .repo-list-item' : 'handleItemClick',
    'input .search': 'handleSearchInput',
    'click .sync': 'handleSync',
    'click .open': 'handleOpen'
  }
}) {
  initialize() {
    this.collection = Repository.Collection.create();
    this.collection.fetch();
    this.listenTo(this.collection, 'sync', this.render);

    // Naive query string parser.
    var query = location.search.slice(1).split('&').reduce(function(query, i) {
      var keyVal = i.split('=');
      query[keyVal[0]] = keyVal[1];
      return query;
    }, {});

    // Pull the search term from the search query.
    this.searchTerm = query.q;

    // Debounce searches to avoid excessive filtering.
    this.handleSearchInput = _.debounce(function(ev) {
      this.searchTerm = ev.currentTarget.value.toLowerCase();
      this.render();
    }, 150);
  }

  handleItemClick(ev) {
    ev.preventDefault();

    let anchor = $(ev.currentTarget).find('a');
    WebApp.history.navigate(anchor.first().attr('href'), true);
  }

  handleSync(ev) {
    let button = this.$(ev.currentTarget);
    let collection = this.collection;

    button.attr('disabled', 'disabled');
    button.addClass('pending');

    return $.getJSON('/api/repositories/sync', function() {
      button.removeAttr('disabled');
      button.removeClass('pending');

      collection.fetch({ reload: true });
    });
  }

  handleOpen(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    return $.get(this.$(ev.currentTarget).attr('href'));
  }

  repositories() {
    if (!this.searchTerm) {
      history.replaceState(null, null, '/');
      return this.collection.toJSON();
    }

    history.replaceState(null, null, '?q=' + this.searchTerm);

    return this.collection.filter(function(repo) {
      return repo.get('location').toLowerCase().indexOf(this.searchTerm) > -1;
    }, this).map(model => model.toJSON());
  }
}
