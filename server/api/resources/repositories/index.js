const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const express = require('express');
const resource = express.Router();
const _ = require('lodash');
const Git = require('nodegit');
const Remarkable = require('remarkable');
const hljs = require('highlight.js');
const homedir = require('homedir');
const moment = require('moment');

const cache = require('./cache');

const getCurrentBranchCommit = require('./git/get-current-branch-commit');
const getCommitDetails = require('./git/get-commit-details');
const normalizeEntries = require('./git/normalize-entries');
const getAllBranches = require('./git/get-all-branches');
const getAllCommits = require('./git/get-all-commits');
const getAllNotes = require('./git/get-all-notes');
const getTreeDiff = require('./git/get-tree-diff');
const getAllTags = require('./git/get-all-tags');
const getBranch = require('./git/get-branch');
const getREADME = require('./git/get-readme');
const getTree = require('./git/get-tree');

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
resource.get('/', function(req, res) {
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
 * Get a raw file at a specific path.
 */
resource.get('/:id/:branch/raw/*', function(req, res, next) {
  var repo = cache.get(req.params.id);
  var entryPath = req.url.split('/').slice(4).join('/');
  var out = {};

  Git.Repository.open(repo.location)
    .then(getBranch(req.params.branch))
    .then(function(branchCommit) {
      return branchCommit.getEntry(entryPath);
    })
    .then(function(entry) {
      return entry.getBlob();
    })
    .then(function(blob) {
      res.end(blob.toString());
    }, next);
});

/**
 * Get a file at a specific path.
 */
resource.get('/:id/:branch/blob/*', function(req, res, next) {
  var repo = cache.get(req.params.id);
  var entryPath = req.url.split('/').slice(4).join('/');
  var out = {};

  Git.Repository.open(repo.location)
    .then(getCurrentBranchCommit)
    .then(function(currentBranchCommit) {
      return currentBranchCommit.getEntry(entryPath);
    })
    .then(function(entry) {
      return entry.getBlob();
    })
    .catch(function(err) {
      if (req.params.branch === '~workdir') {
        return new Promise(function(resolve, reject) {
          fs.readFile(path.join(repo.location, entryPath), function(err, buffer) {
            if (err) { reject(err); }
            else { resolve(buffer); }
          });
        });
      }

      throw err;
    })
    .then(function(blob) {
      if (blob.length < 2048) {
        out.blob = hljs.highlightAuto(blob.toString()).value.trim();
      }
      else {
        out.blob = blob.toString().trim();
      }

      out.blob = out.blob.split('\n').map(function(line) {
        return '<div class="line">' + line + '</div>';
      }).join('');

      res.json(out);
    }, next);
});

/**
 * Get a tree at a specific path.
 */
resource.get('/:id/:branch/tree/*', function(req, res, next) {
  var repo = cache.get(req.params.id);
  var root = req.url.split('/').slice(4).join('/');

  if (root.slice(-1) === '/') {
    root = root.slice(0, -1);
  }

  var resolveBranchCommit = function(currentBranchCommit) {
    if (root) {
      return currentBranchCommit.getEntry(root).catch(function() {
        return currentBranchCommit;
      });
    }

    return currentBranchCommit;
  };

  Git.Repository.open(repo.location)
    .then(getCurrentBranchCommit)
    .then(resolveBranchCommit)
    .then(getTree)
    .then(function(tree) {
      if (req.params.branch === '~workdir') {
        return new Promise(function(resolve, reject) {
          fs.readdir(path.join(repo.location, root), function(err, list) {
            if (err) throw err;

            var entries = list.map(function(entry) {
              return {
                isDirectory: function() {
                  return fs.statSync(path.join(repo.location, root, entry)).isDirectory();
                },

                path: function() {
                  return path.join(root, entry);
                }
              };
            });

            resolve({
              entries: function() {
                return entries;
              },

              repo: tree.repo
            });
          });
        });
      }

      return tree;
    })
    .then(function(tree) {
      var entries = tree.entries().map(function(entry) {
        return {
          isDirectory: entry.isDirectory(),
          path: entry.path(),
          isIgnored: Boolean(Git.Ignore.pathIsIgnored(tree.repo, entry.path()))
        };
      });

      return _.chain(entries).sortBy(function(entry) {
        return entry.path.toLowerCase();
      }).sortBy(function(entry) {
        return !entry.isDirectory;
      }).value();
    })
    .then(normalizeEntries(root))
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
      //out.branch = branch.name().slice('refs/heads/'.length);
      out.branch = '~workdir';
    });

    var readme = currentBranchCommit.then(getREADME('~workdir')).then(function(blob) {
      out.readme = md.render(blob.toString());
    });

    var commitDetails = currentBranchCommit.then(getCommitDetails)
      .then(function(commit) {
        out.commit = commit;
      });

    var allNotes = getAllNotes(repository).then(function(notes) {
      out.notes = notes ? notes.length : 0;
    });

    var allCommits = getAllCommits()(repository).then(function(commits) {
      out.commits = commits.length;
    });

    var allBranches = getAllBranches(repository).then(function(branches) {
      out.branches = branches || [];
    });

    var allTags = getAllTags(repository).then(function(tags) {
      out.tags = tags.length;
    });

    var patches = currentBranchCommit
      .then(getTree)
      .then(getTreeDiff).then(function(patches) {
        out.patches = patches;
      });

    return Promise.all([
      readme,
      commitDetails,
      allNotes,
      allCommits,
      allTags,
      branchName,
      allBranches,
      patches,
    ]);
  }).then(function() {
    res.json(out);
  }, next);
});

module.exports = resource;
