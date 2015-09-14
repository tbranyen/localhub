'use strict';

import WebApp from 'webapp';
import { CommitModel } from './commit';

var RepositoryModel = WebApp.Model.extend({
  urlRoot: '/api/repositories',

  defaults: {
    branches: 0,
    commits: 0,
    notes: 0,
    tags: 0,
    name: '',
    readme: ''
  },

  idAttribute: 'repo',

  parse: function(resp) {
    // Normalize commits to models.
    if (resp.commit) {
      this.commit = CommitModel.create(resp.commit, { parse: true });
    }

    return resp;
  },

  initialize: function() {
    this.commit = CommitModel.create();
  }
});

var RepositoryCollection = WebApp.Collection.extend({
  model: RepositoryModel,
  url: '/api/repositories'
});

module.exports = {
  Model: RepositoryModel,
  Collection: RepositoryCollection
};
