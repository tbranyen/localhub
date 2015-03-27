define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var $ = WebApp.$;

  // Import all pages.
  var HomePage = require('./pages/home/home');
  var RepositoryPage = require('./pages/repository/repository');
  var CommitsPage = require('./pages/commits/commits');

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
      '': 'homePage',
      'repository/:id': 'repositoryPage',
      'repository/:id/:branch/commits': 'commitsPage',
      'repository/:id/:branch/blob/*file': 'filePage'
    },

    initialize: function() {
      this.container = Application;

      this.on('route', function(name) {
        this.container.$el.removeClass().addClass(name.split('P').join('-p'));
      });
    },

    homePage: function() {
      var homePage = HomePage.create();
      this.container.setView(homePage).render();
    },

    repositoryPage: function(id) {
      var repositoryPage = RepositoryPage.create({ id: id });
      this.container.setView(repositoryPage).render();
    },

    filePage: function(id, branch, file) {
      // Set up the repository page.
      this.repository(id);
    },

    commitsPage: function() {
      var commitsPage = CommitsPage.create(this.params);
      this.container.setView(commitsPage).render();
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
