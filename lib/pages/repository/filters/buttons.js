define(function(require, exports, module) {
  'use strict';

  module.exports = function(val, hasFile) {
    return val.split('/').filter(Boolean).map(function(val, index, list) {
      if (list.length === index + 1 && hasFile) {
        return val;
      }

      return '<button class="btn btn-path btn-sm">' + val + '</button>';
    }).join('<span class="sep">/</span>');
  };
});
