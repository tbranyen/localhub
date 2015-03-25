var _ = require('lodash');

function getTree(commit) {
  return commit.getTree().then(function(tree) {
    var entries = tree.entries().map(function(entry) {
      return { isDirectory: entry.isDirectory(), path: entry.path() };
    });

    return _.chain(entries).sortBy(function(entry) {
      return entry.path.toLowerCase();
    }).sortBy(function(entry) {
      return !entry.isDirectory;
    }).value();
  });
}

module.exports = getTree;
