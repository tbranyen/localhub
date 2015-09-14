var _ = require('lodash');

function getTree(commit) {
  return commit.getTree();
}

module.exports = getTree;
