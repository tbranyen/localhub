'use strict';

import WebApp from 'webapp';
import template from './file.html';

import Repository from '../../resources/repository';
import FileBlob from '../../components/file-blob/file-blob';
var File = require('../../resources/file');

var $ = WebApp.$;

var FilePage = WebApp.View.extend({
  template: template,

  events: {
    'click .directory': 'handleDirectory',
    'click .clipboard': 'clickClipboard'
  },

  clickClipboard: function(ev) {
    $(ev.currentTarget).next('input')[0].select();
    document.execCommand('copy');
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

  refreshData: function() {
    var model = this.model;

    return this.model.fetch().then(function() {
      return model.file.fetch();
    });
  },

  initialize: function() {
    this.model = Repository.Model.create({ repo: this.repo });
    this.listenTo(this.model, 'sync', this.render);

    var file = File.Model.create();
    file.repo = this.model;
    file.path = this.file;

    // Attach to the respository model.
    this.model.file = file;

    this.setView('.outlet', FileBlob.create({
      model: file
    }));
  }
});

module.exports = FilePage;
