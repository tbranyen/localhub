'use strict';

import WebApp from 'webapp';
import template from './repository.html';
import Repository from '../../resources/repository';
import { TreeCollection } from '../../resources/tree';

var RepositoryPage = WebApp.View.extend({
  template: template,

  events: {
    'input .branch': 'changeBranch'
  },

  changeBranch: function(ev) {
    ev.preventDefault();

    var branch = ev.currentTarget.value;

    WebApp.history.navigate('repository/' + this.repo + '/' + branch + '/tree/', true);
  },

  initialize: function() {
    this.model = Repository.Model.create({ repo: this.repo });
    this.listenTo(this.model, 'sync', this.render);

    this.collection = TreeCollection.create(this.model);
    this.collection.repo = this.model;
    this.collection.path = this.path || '';

    this.listenTo(this.collection, 'showHidden', function() {
      this.$('.menu').toggleClass('show-hidden', this.collection.showHidden);
    });
  }
});

export default RepositoryPage;
