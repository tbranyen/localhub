define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./file.html');

  var Repository = require('../../resources/repository');
  var FileBlob = require('../../components/file-blob/file-blob');

  var File = require('../../resources/file');

  var FilePage = WebApp.View.extend({
    template: template,

    events: {
      'click .directory': 'handleDirectory'
    },

    handleDirectory: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      var directory = this.$(ev.currentTarget).data('path');

      WebApp.history.navigate([
        'repository',
        this.model.id,
        this.model.get('branch'),
        'tree',
        directory
      ].join('/'), true);
    },

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

  module.exports = FilePage;
});
