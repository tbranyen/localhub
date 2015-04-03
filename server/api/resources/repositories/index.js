var path = require('path');
var exec = require('child_process').exec;
var express = require('express');
var resource = express();
var Git = require('nodegit');
var Remarkable = require('remarkable');
var hljs = require('highlight.js');
var homedir = require('homedir');
var moment = require('moment');

var cache = require('./cache');

var getCurrentBranchCommit = require('./git/get-current-branch-commit');
var getCommitDetails = require('./git/get-commit-details');
var getAllBranches = require('./git/get-all-branches');
var getAllCommits = require('./git/get-all-commits');
var getAllNotes = require('./git/get-all-notes');
var getAllTags = require('./git/get-all-tags');
var getREADME = require('./git/get-readme');
var getTree = require('./git/get-tree');

var defaultPath = homedir();

cache.init(defaultPath);

var md = new Remarkable({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,

  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, str).value;
    }

    return hljs.highlightAuto(str).value;
  }
});

/**
 * Get all repositories directly from the filesystem.
 *
 * @public
 * @return {Array} of repository objects.
 */
resource.get('/', function(req, res, next) {
  res.json(cache.get());
});

/**
 * Attempts to open the folder using the OS file explorer.
 *
 * @return
 */
resource.get('/open', function(req, res) {
  // Try opening the folder in various operating systems.
  exec([
    // Linux.
    'xdg-open ' + req.query.path,
    // Mac OS X.
    'open ' + req.query.path,
    // Windows.
    'explorer ' + req.query.path
  ].join(' || '));
});

/**
 * Rebuild the internal Git cache.
 */
resource.get('/sync', function(req, res, next) {
  cache.rebuild(defaultPath, function() {
    res.json({ ok: true });
  });
});

/**
 * Get a specific repository's metadata.
 */
resource.get('/:id/:branch/commits', function(req, res, next) {
  var repo = cache.get(req.params.id);

  Git.Repository.open(repo.location)
    .then(getAllCommits('refs/heads/' + req.params.branch))
    .then(function(commits) {
      res.json(commits.map(function(commit) {
        var details = getCommitDetails(commit);
        var precise = moment(commit.date());

        details.timeline = precise.format('YYYY,MM,DD');

        return details;
      }));
    });
});

/**
 * Get a specific repository's metadata.
 */
resource.get('/:id', function(req, res, next) {
  var repo = cache.get(req.params.id);

  var out = {
    name: repo.name,
    location: repo.location,
    commits: 0,
    notes: 0,
    tags: 0,
    commit: {
      message: 'Hello world!'
    }
  };

  Git.Repository.open(repo.location).then(function(repository) {
    var currentBranchCommit = getCurrentBranchCommit(repository);

    // Attach the branch name.
    var branchName = repository.getCurrentBranch().then(function(branch) {
      out.branch = branch.name().slice('refs/heads/'.length);
    });

    var tree = currentBranchCommit.then(getTree).then(function(entries) {
      out.tree = entries;
    });

    var readme = currentBranchCommit.then(getREADME).then(function(blob) {
      out.readme = md.render(blob.toString());
    });

    var commitDetails = currentBranchCommit.then(getCommitDetails)
      .then(function(commit) {
        out.commit = commit;
      });

    var allNotes = getAllNotes(repository).then(function(notes) {
      out.notes = notes.length;
    });

    var allCommits = getAllCommits()(repository).then(function(commits) {
      out.commits = commits.length;
    });

    var allBranches = getAllBranches(repository).then(function(branches) {
      out.branches = branches.length;
    });

    var allTags = getAllTags(repository).then(function(tags) {
      out.tags = tags.length;
    });

    return Promise.all([
      tree,
      readme,
      commitDetails,
      allNotes,
      allCommits,
      allTags,
      branchName,
      allBranches,
    ]);
  }).then(function() {
    res.json(out);
  }).catch(function(ex) {
    next(ex);
  });
});

module.exports = resource;
