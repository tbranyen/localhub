'use strict';

import WebApp from 'webapp';

var local = window.localStorage;

export var TreeCollection = WebApp.Collection.extend({
  initialize: function(repo) {
    this.showHidden = local.showHidden ? local.showHidden === 'true' : true;
  },

  showHiddenFiles: function(isHidden) {
    this.showHidden = isHidden;
    local.showHidden = isHidden;
    this.trigger('showHidden');
  },

  url: function() {
    return [
      '/api/repositories',
      this.repo.id,
      this.repo.get('branch'),
      'tree',
      this.path
    ].join('/');
  }
});
