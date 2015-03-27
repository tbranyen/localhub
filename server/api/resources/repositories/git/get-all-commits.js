var Git = require('nodegit');

function getAllCommits(branchName) {
  return function(repository) {
    var walker = repository.createRevWalk();

    if (branchName) {
      walker.pushRef(branchName);
    }
    else {
      walker.pushHead();
    }

    walker.sorting(Git.Revwalk.SORT.TIME);

    return walker.getCommits(Infinity);
  };
}

module.exports = getAllCommits;
