'use strict';

var WebApp = require('webapp');
var template = require('./repository.html');

var Repository = require('../../resources/repository');
var Tree = require('../../resources/tree');

var RepositoryPage = WebApp.View.extend({
  template: template,

  initialize: function() {
    this.model = Repository.Model.create({ repo: this.repo });
    this.listenTo(this.model, 'sync', this.render);

    this.collection = Tree.Collection.create();
    this.collection.repo = this.model;
    this.collection.path = this.path || '';

    this.listenTo(this.collection, 'showHidden', function() {
      this.$('.menu').toggleClass('show-hidden', this.collection.showHidden);
    });
  }
});

module.exports = RepositoryPage;
