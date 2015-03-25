define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./repository.html');

  var Repository = require('../../resources/repository');

  var RepositoryPage = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.model = Repository.Model.create({ id: this.id });
      this.model.fetch();

      this.listenTo(this.model, 'sync', this.render);
    }
  });

  module.exports = RepositoryPage;
});
