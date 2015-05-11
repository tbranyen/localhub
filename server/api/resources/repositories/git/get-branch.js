function getBranch(name) {
  return function(repository) {
    return repository.getBranchCommit(name);
  };
}

module.exports = getBranch;
