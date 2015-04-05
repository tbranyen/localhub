define(function(require, exports, module) {
  'use strict';

  module.exports = function(val, hasFile) {
    var abs = '';

    var btns = val.split('/').filter(Boolean).map(function(val, index, list) {
      abs += val + '/';

      var basedir = abs.split('/');
      basedir.pop();

      return { rel: val, abs: basedir.join('/') + '/' };
    });

    return [{ rel: '.', abs: '' }].concat(btns);
  };
});
