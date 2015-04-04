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
var normalizeEntries = require('./git/normalize-entries');
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

  res.end();
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
 * Get a file at a specific path.
 */
resource.get('/:id/:branch/blob/*', function(req, res, next) {
  var repo = cache.get(req.params.id);
  var path = req.url.split('/').slice(4).join('/');
  var out = {};

  Git.Repository.open(repo.location)
    .then(getCurrentBranchCommit)
    .then(function(currentBranchCommit) {
      return currentBranchCommit.getEntry(path);
    })
    .then(function(entry) {
      return entry.getBlob();
    })
    .then(function(blob) {
      out.blob = hljs.highlightAuto(blob.toString()).value;

      res.json(out);
    }, next);
});

/**
 * Get a tree at a specific path.
 */
resource.get('/:id/:branch/tree/*', function(req, res, next) {
  var repo = cache.get(req.params.id);
  var path = req.url.split('/').slice(4).join('/');

  Git.Repository.open(repo.location)
    .then(getCurrentBranchCommit)
    .then(function(currentBranchCommit) {
      if (path) {
        return currentBranchCommit.getEntry(path);
      }

      return currentBranchCommit;
    })
    .then(getTree)
    .then(normalizeEntries(path))
    .then(function(entries) {
      res.json(entries);
    }, next);
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
  }, next);
});

module.exports = resource;
