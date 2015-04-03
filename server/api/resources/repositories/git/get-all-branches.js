var Git = require('nodegit');

function getAllBranches(repository) {
  return repository.getReferenceNames(Git.Reference.TYPE.OID).then(function(branches) {
    return branches.filter(function(branch) {
      return branch.indexOf('head') > -1;
    });
  });
}

module.exports = getAllBranches;
