'use strict';

import WebApp from 'webapp';

export var Model = WebApp.Model.extend({
  url: function() {
    return [
      '/api/repositories',
      this.repo.id,
      this.repo.get('branch'),
      'blob',
      this.path
    ].join('/');
  }
});
