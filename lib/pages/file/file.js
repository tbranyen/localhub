define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./file.html');

  var Repository = require('../../resources/repository');
  var FileBlob = require('../../components/file-blob/file-blob');

  var File = require('../../resources/file');

  var RepositoryPage = WebApp.View.extend({
    template: template,

    initialize: function() {
      this.model = Repository.Model.create({ repo: this.repo });
      this.listenTo(this.model, 'sync', this.render);

      var file = File.Model.create();
      file.repo = this.model;
      file.path = this.file;

      // Attach to the respository model.
      this.model.file = file;

      this.model.fetch().then(function() {
        file.fetch();
      });

      this.setView('.outlet', FileBlob.create({
        model: file
      }));
    }
  });

  module.exports = RepositoryPage;
});
