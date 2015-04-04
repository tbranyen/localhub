define(function(require, exports, module) {
  'use strict';

  module.exports = function(val, start, end) {
    return val.slice(start, end);
  };
});
