define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var $ = WebApp.$;

  // Import all pages.
  var HomePage = require('./pages/home/home');
  var RepositoryPage = require('./pages/repository/repository');

  // Create the application.
  var Application = WebApp.create({ root: '/' });

  // Configure templating.
  WebApp.Component.configure({
    fetchTemplate: function(template) {
      return template.render.bind(template);
    },
  });

  // Set up the route states.
  WebApp.Router.create({
    routes: {
      '': 'index',
      'repository/:id': 'repository',
      'repository/:id/tree/:branch/*folder': 'showFolder',
      'repository/:id/blob/:branch/*file': 'showFile'
    },

    initialize: function() {
      this.container = Application;
    },

    index: function() {
      var homePage = HomePage.create();
      this.container.setView(homePage).render();
    },

    repository: function(id) {
      var repositoryPage = RepositoryPage.create({ id: id });
      this.container.setView(repositoryPage).render();
    },

    showFile: function(id, branch, file) {
      var filePage = FilePage.create({ id: id, branch: branch, file: file });
      this.container.setView(repositoryPage).render();
    }
  });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
    // Get the absolute anchor href.
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    // Get the absolute root.
    var root = location.protocol + "//" + location.host + Application.root;

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      WebApp.history.navigate(href.attr, true);
    }
  });

  // Kick off the application!
  Application.start();
});
