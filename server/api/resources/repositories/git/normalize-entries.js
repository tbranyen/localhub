var path = require('path');

function normalizeEntries(root) {
  return function(entries) {
    return entries.map(function(entry) {
      entry.root = root;
      entry.absolute = entry.path;
      entry.path = root ? entry.path.slice(root.length + 1) : entry.path;

      return entry;
    });
  };
}

module.exports = normalizeEntries;
