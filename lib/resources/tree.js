'use strict';

import WebApp from 'webapp';

var local = window.localStorage;

var TreeCollection = WebApp.Collection.extend({
  initialize: function() {
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

export var Collection = TreeCollection;
