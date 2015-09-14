var path = require('path');
var _ = require('lodash');
var Git = require('nodegit');

var statusToDelta = function(delta) {
  var match = null;

  Object.keys(Git.Diff.DELTA).forEach(function(label) {
    if (Git.Diff.DELTA[label] === delta) {
      match = label;
    }
  });

  return match.toLowerCase();
};

function getTreeDiff(tree) {
  return Git.Diff.treeToWorkdirWithIndex(tree.repo, tree).then(function(diff) {
    return diff.patches();
  }).then(function(patches) {
    return patches.reduce(function(patches, patch) {
      patches[patch.newFile().path()] = statusToDelta(patch.status());
      return patches;
    }, {});
  });
}

module.exports = getTreeDiff;
