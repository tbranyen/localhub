function getCurrentBranchCommit(repository) {
  return repository.getCurrentBranch().then(function(branch) {
    return repository.getBranchCommit(branch.name());
  });
}

module.exports = getCurrentBranchCommit;
