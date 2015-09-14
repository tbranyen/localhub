'use strict';

module.exports = function(val) {
  return val.split('/').slice(0, -1).join('/');
};
