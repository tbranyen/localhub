var fs = require('fs');
var path = require('path');

/**
 * Recursively find shallow Git repositories (not nested).
 *
 * @param filePath
 * @param done
 * @return
 */
function recurseDirectory(filePath, done) {
  var results = [];

  fs.readdir(filePath, function(err, files) {
    if (err) { return done(results); }

    var semaphore = 0;
    var gitLoc = files.indexOf('.git');

    // Add this folder as a git repo to the list.
    if (gitLoc > -1) {
      results.push(path.join(filePath, files[gitLoc]));
      return done(results);
    }

    function recurse() {
      var file = files[semaphore++];

      if (!file) {
        return done(results);
      }

      var normal = path.join(filePath, file);

      if (file.indexOf('.') === 0 || file === 'tmp') {
        return recurse();
      }

      fs.stat(normal, function(err, stat) {
        if (err) { return recurse(); }

        if (stat.isDirectory()) {
          recurseDirectory(normal, function(res) {
            results = results.concat(res);
            recurse();
          });
        }
        else {
          recurse();
        }
      });
    }

    recurse();
  });
}

module.exports = recurseDirectory;
