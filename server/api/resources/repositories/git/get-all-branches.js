var Git = require('nodegit');

function getAllBranches(repository) {
  return repository.getReferenceNames(Git.Reference.TYPE.ALL, function(error, branches) {
    return branches;
  });
}

module.exports = getAllBranches;
