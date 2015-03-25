var Git = require('nodegit');

function getAllNotes(repository) {
  var notes = [];

  if (!Git.Note.foreach) {
    return Promise.resolve(notes);
  }

  return Git.Note.foreach(repository, 'refs/notes/commits', function(note) {
    notes.push(note);
  }).then(notes, function() {
    return notes;
  });
}

module.exports = getAllNotes;
