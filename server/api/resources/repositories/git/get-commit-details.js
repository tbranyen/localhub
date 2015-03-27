var moment = require('moment');

function getCommitDetails(commit) {
  var out = {};

  out.message = commit.message();
  out.sha = commit.sha();
  out.date = moment(commit.date()).fromNow();
  out.author = {
    name: commit.author().name(),
    email: commit.author().email()
  };

  return out;
}

module.exports = getCommitDetails;
