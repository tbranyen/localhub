var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var recurseDirectory = require('./util/recurse-directory');
var local = path.join.bind(path, __dirname);

var cachefile = null;
var index = {};

try {
  cachefile = require('./cachefile.json');
} catch(unhandledException) {}

/**
 * Build the cache if missing cachefile, otherwise build the index.
 *
 * @param root
 * @return
 */
exports.init = function(root) {
  if (!cachefile) {
    console.log('>> No cachefile found, rebuilding index.');
    exports.rebuild(root);
  }
  else {
    exports.buildIndex();
  }
};

/**
 * buildIndex
 *
 * @return
 */
exports.buildIndex = function() {
  cachefile.forEach(function(item) {
    index[item.id] = item;
  });
};

/**
 * Completely scan the filesystem and rebuild the index.
 *
 * @return
 */
exports.rebuild = function(root, callback) {
  recurseDirectory(root, function(dirs) {
    var out = dirs.map(function(dir) {
      dir = dir.slice(0, -4);

      return {
        id: crypto.createHash('md5').update(dir).digest("hex"),
        name: path.basename(dir),
        location: dir
      };
    }).sort(function(a, b) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    var localCache = local('./cachefile.json');

    cachefile = out;

    exports.buildIndex();

    fs.writeFile(localCache, JSON.stringify(out, null, 2), function() {
      console.log('>> Completed indexing.');

      if (callback) { callback(out); }
    });
  });
};

/**
 * Access the cachefile.
 *
 * @return
 */
exports.get = function(id) {
  if (id) {
    return index[id];
  }

  return cachefile || [];
};

/**
 * Get a list of parent directories, sorted by most contained Git repositories.
 *
 * @return
 */
exports.containers = function() {};
