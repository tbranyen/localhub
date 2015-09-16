'use strict';

import WebApp from 'webapp';
import blueimp from 'blueimp-md5';

export var CommitModel = WebApp.Model.extend({
  defaults: {
    message: 'No commit message',
    author: {}
  },

  parse: function(resp) {
    this.oneline = resp.message.split('\n')[0];
    this.hash = blueimp.md5(resp.author.email);

    return resp;
  }
});

export var CommitCollection = WebApp.Collection.extend({
  model: CommitModel,

  url: function() {
    return [
      '/api/repositories', this.repo, this.branch, 'commits'
    ].join('/');
  }
});
