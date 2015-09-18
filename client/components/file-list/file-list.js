'use strict';

import WebApp from 'webapp';

var local = window.localStorage;

var FileListComponent = WebApp.View.extend({
  initialize: function() {
    this.showHidden = local.showHidden ? local.showHidden === 'true' : true;
    this.listenTo(this.collection, 'sync', this.render);
  },

  events: {
    'click .directory': 'handleDirectory',
    'click .switch': 'toggleSwitch',
    'change .branch': 'changeBranch'
  },

  changeBranch: function(ev) {
    ev.preventDefault();

    this.collection.repo.set('branch', ev.currentTarget.value);
  },

  toggleSwitch: function(ev) {
    var label = this.$('.switch label');
    var input = this.$('.switch input');
    var target = this.$(ev.target);

    if (target.is('.text')) {
      label.click();
      this.collection.showHiddenFiles(input.prop('checked'));
      return;
    }

    this.collection.showHiddenFiles(input.prop('checked'));
  },

  handleDirectory: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var directory = this.$(ev.currentTarget).attr('data-path');
    this.collection.path = directory;
    this.collection.fetch({ reset: true });

    WebApp.history.navigate([
      'repository',
      this.collection.repo.id,
      this.collection.repo.get('branch'),
      'tree',
      directory
    ].join('/'));
  },

  handleFile: function(ev) {
    ev.preventDefault();
  }
});

module.exports = FileListComponent;
