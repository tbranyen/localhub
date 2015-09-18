const fs = require('fs');

function getREADME(branch) {
  if (branch === '~workdir') {
    return new Promise(function(resolve, reject) {
      fs.readFile('README.md', function(err, buffer) {
        if (err) { resolve('No README found.'); }
        else { resolve(buffer.toString()); }
      });
    });
  }

  return function(commit) {
    return commit.getEntry('README.md').catch(function() {
      return commit.getEntry('readme.md')
    }).then(function(treeEntry) {
      return treeEntry.getBlob();
    }).catch(function(ex) {
      return 'No README found.';
    });
  };
}

module.exports = getREADME;
