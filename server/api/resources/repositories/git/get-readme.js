function getREADME(commit) {
  return commit.getEntry('README.md').catch(function() {
    return commit.getEntry('readme.md');
  }).then(function(treeEntry) {
    return treeEntry.getBlob();
  }).catch(function(ex) {
    console.log(ex.stack);
    return 'No README found.';
  });
}

module.exports = getREADME;
