define(function(require, exports, module) {
  'use strict';

  module.exports = function(val, hasFile) {
    var abs = '';

    var btns = val
      .split('/')
      .filter(Boolean).map(function(val, index, list) {
        abs += val + '/';

        var basedir = abs.split('/');
        basedir.pop();

        var retVal = { rel: val, abs: basedir.join('/') + '/' };

        if (index === list.length - 1) {
          retVal.isFile = true;
        }

        return retVal;
      });

    return [{ rel: '.', abs: '' }].concat(btns);
  };
});
