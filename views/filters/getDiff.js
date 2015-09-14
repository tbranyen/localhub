'use strict';

module.exports = function(val, repo) {
  var patches = repo.get('patches') || {};

  // Direct file match.
  if (patches[val]) {
    return patches[val];
  }

  var match = '';

  Object.keys(patches).forEach(function(path) {
    var slashes = val.match(/\//g) || [];

    if (path.split('/').slice(0, slashes.length + 1).join('/') === val) {
      match = patches[path];
    }
  });

  return match;
};
