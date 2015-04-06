define(function(require, exports, module) {
  'use strict';

  var WebApp = require('webapp');
  var $ = WebApp.$;
  var _ = WebApp._;

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

    useRAF: false
  });

  ['Model', 'Collection'].forEach(function(ctor) {
    var oldSync = WebApp[ctor].prototype.sync;

    WebApp[ctor].prototype.sync = function(method, model, options) {
      var url = _.result(this, 'url');
      var cache = sessionStorage[url];

      if (cache && !options.reload) {
        cache = JSON.parse(cache);
        options.success.apply(this, cache);
        return Promise.all(cache);
      }

      var jqXHR = oldSync.apply(this, arguments);

      jqXHR.then(function(resp) {
        sessionStorage[url] = JSON.stringify([arguments[0], 'success', {}]);
      });

      return jqXHR;
    };
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

      var router = this;

      this.on('route', function(name) {
        this.page.p2p = p2p;
        this.container.setView(this.page).render();
        this.container.$el.removeClass().addClass(name.split('P').join('-p'));
        this.p2p.on('open', this.container.render.bind(this.container));
      });
    },

    homePage: function() {
      this.page = HomePage.create();
    },

    repositoryPage: function() {
      this.page = RepositoryPage.create(this.params);

      this.page.setView('.outlet', FileList.create({
        collection: this.page.collection,
        model: this.page.model
      }));

      var repositoryPage = this.page;

      setTimeout(function() {
        this.page.model.fetch().then(function() {
          repositoryPage.collection.fetch();
        });
      }.bind(this), 0);
    },

    commitsPage: function() {
      this.page = CommitsPage.create(this.params);
    },

    filePage: function() {
      this.page = FilePage.create(this.params);

      var model = this.page.model;

      setTimeout(function() {
        this.page.model.fetch().then(function() {
          model.file.fetch();
        });
      }.bind(this), 0);
    },

    treePage: function() {
      var repositoryPage = RepositoryPage.create(this.params);
      this.page = repositoryPage;

      repositoryPage.setView('.outlet', FileList.create({
        collection: repositoryPage.collection,
        model: repositoryPage.model
      }));

      setTimeout(function() {
        repositoryPage.model.fetch().then(function() {
          repositoryPage.collection.fetch();
        });
      }, 0);
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
