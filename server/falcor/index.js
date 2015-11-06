'use strict';

const Router = require('falcor-router');
const JsonGraph = require('falcor-json-graph');
const homedir = require('homedir');
const cache = require('../api/resources/repositories/cache');

cache.init(homedir());

var BaseRouter = Router.createClass([{
  route: 'repositories',

  get: function(path) {
    // FIXME There is an upstream fix necessary within falcor to remove this
    // line.
    return { path, value: cache.get().map(x => Object.assign({}, x)) };
  }
}]);

module.exports = class LocalHubRouter extends BaseRouter {
  constructor() {
    super();
  }
}
