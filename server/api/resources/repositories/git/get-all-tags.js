var Git = require('nodegit');

function getAllTags(repository) {
  return Git.Tag.list(repository);
}

module.exports = getAllTags;
