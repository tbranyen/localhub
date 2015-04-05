define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var template = require('./file-blob.html');

  var FileBlobComponent = WebApp.View.extend({
    template: template,

    events: {
      'click .line': 'handleLineClick'
    },

    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
    },

    handleLineClick: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      var line = this.$(ev.currentTarget);
      var lines = line.siblings();
      var index = line.index();
      var prevIndex = line.siblings().filter('.active').index();

      if (line.hasClass('active')) {
        location.hash = '';
        return line.removeClass('active');
      }

      location.hash = index;

      if (ev.shiftKey) {
        location.hash = prevIndex + ':' + index;

        if (prevIndex < index) {
          line.prevUntil('.active').addClass('active');
        }
        else {
          line.nextUntil('.active').addClass('active');
        }
      }
      else {
        lines.removeClass('active');
      }

      line.addClass('active');
    },

    beforeRender: function() {
      return Boolean(this.model.get('blob'));
    },

    afterRender: function() {
      var lines = this.$('.line');

      if (location.hash) {
        var parts = location.hash.slice(1).split(':').map(Number);

        lines.removeClass('active');

        if (parts.length === 2) {
          lines.slice(parts[0], parts[1] + 1).addClass('active');
        }
        else {
          lines.slice(parts[0], parts[0] + 1).addClass('active');
        }
      }
    }
  });

  module.exports = FileBlobComponent;
});
