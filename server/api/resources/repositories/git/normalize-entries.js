var path = require('path');

function normalizeEntries(root) {
  return function(entries) {
    return entries.map(function(entry) {
      var normalized = root ? path.join(root, '../', entry.path) : entry.path;

      entry.root = root;
      entry.absolute = normalized;
      entry.path = root ? normalized.slice(root.length + 1) : entry.path;

      return entry;
    });
  };
}

module.exports = normalizeEntries;
