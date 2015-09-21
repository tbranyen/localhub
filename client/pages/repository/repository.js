'use strict';

import WebApp from 'webapp';

import Page from '../page';
import Repository from '../../resources/repository';
import { TreeCollection } from '../../resources/tree';
import template from '../../../views/pages/repository.html';

export default Page.extend({
  template,

  events: {
    'input .branch': 'changeBranch'
  },

  changeBranch(ev) {
    ev.preventDefault();

    var branch = ev.currentTarget.value;

    WebApp.history.navigate('repository/' + this.repo + '/' + branch + '/tree/', true);
  },

  initialize() {
    this.model = Repository.Model.create({ repo: this.repo });

    this.collection = TreeCollection.create(this.model);
    this.collection.repo = this.model;
    this.collection.path = this.path || '';

    this.listenTo(this.collection, 'showHidden', function() {
      this.$('.menu').toggleClass('show-hidden', this.collection.showHidden);
    });

    Promise.all([
      this.model.fetch(),
      this.collection.fetch()
    ]).then(() => {
      this.render();
      this.listenTo(this.model, 'sync', this.render);
      this.listenTo(this.collection, 'sync', this.render);
    });
  }
});
