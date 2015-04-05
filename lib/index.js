define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var $ = WebApp.$;

  // This is not a well formed module.
  var Peer = require('peerjs/dist/peer');

  // Import all pages.
  var HomePage = require('./pages/home/home');
  var RepositoryPage = require('./pages/repository/repository');
  var CommitsPage = require('./pages/commits/commits');
  var FilePage = require('./pages/file/file');

  var FileList = require('./components/file-list/file-list');

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
      'repository/:repo': 'repositoryPage',
      'repository/:repo/:branch/commits': 'commitsPage',
      'repository/:repo/:branch/blob/*file': 'filePage',
      'repository/:repo/:branch/tree/*path': 'treePage'
    },

    initialize: function() {
      this.container = Application;

      var p2p = this.p2p = new Peer({
        host: 'p2p.tbranyen.com',
        port: 80,
        path: '/',
        debug: 3
      });

      this.on('route', function(name) {
        this.container.getView().p2p = p2p;
        this.container.$el.removeClass().addClass(name.split('P').join('-p'));

        this.p2p.on('open', this.container.render.bind(this.container));
      });
    },

    homePage: function() {
      var homePage = HomePage.create();
      this.container.setView(homePage).render();
    },

    repositoryPage: function() {
      var repositoryPage = RepositoryPage.create(this.params);
      this.container.setView(repositoryPage).render();

      repositoryPage.setView('.outlet', FileList.create({
        collection: repositoryPage.collection,
        model: repositoryPage.model
      }));

      repositoryPage.model.fetch().then(function() {
        repositoryPage.collection.fetch();
      });
    },

    commitsPage: function() {
      var commitsPage = CommitsPage.create(this.params);
      this.container.setView(commitsPage).render();
    },

    filePage: function() {
      var filePage = FilePage.create(this.params);
      this.container.setView(filePage).render();
    },

    treePage: function() {
      var repositoryPage = RepositoryPage.create(this.params);
      this.container.setView(repositoryPage).render();

      repositoryPage.setView('.outlet', FileList.create({
        collection: repositoryPage.collection,
        model: repositoryPage.model
      }));

      repositoryPage.model.fetch().then(function() {
        repositoryPage.collection.fetch();
      });
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
  Application.start({ pushState: true });
});
