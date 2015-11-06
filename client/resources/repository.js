'use strict';

import WebApp from 'webapp';
import { CommitModel } from './commit';
import API from './index';

var RepositoryModel = WebApp.Model.extend({
  urlRoot: '/api/repositories',

  defaults: {
    branch: '~workdir',
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

  sync: function(method, model, options) {
    return API.get('repositories[0..500]["name", "id", "location"]')
      .then(options.success)
      .catch(options.failure);
  },

  parse: function(resp) {
    var repositories = resp.json.repositories;
    repositories.length = Object.keys(repositories).length - 1;

    return Array.prototype.slice.call(repositories);
  }
});

module.exports = {
  Model: RepositoryModel,
  Collection: RepositoryCollection
};
