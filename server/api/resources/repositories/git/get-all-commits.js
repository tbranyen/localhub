function getAllCommits(repository) {
  var walker = repository.createRevWalk();
  walker.pushHead();
  return walker.getCommits(Infinity);
}

module.exports = getAllCommits;
