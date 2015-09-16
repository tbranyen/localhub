'use strict';

import WebApp from 'webapp';
import { $, _ } from 'webapp';

// Import all pages.
import HomePage from './pages/home/home';
import RepositoryPage from './pages/repository/repository';
import CommitsPage from './pages/commits/commits';
import FilePage from './pages/file/file';
import FileList from './components/file-list/file-list';

// Create the application.
const Application = WebApp.create({ root: '/' });

// Configure templating.
WebApp.Component.configure({
  fetchTemplate: function(template) {
    return template.render.bind(template);
  },

//  html: function($root, content) {
//    var root = $root instanceof $ ? $root[0] : $root;
//
//    if (root) {
//      if (typeof content === 'string') {
//        diff.innerHTML(root, content);
//      }
//      else {
//        var firstChild = root.firstChild;
//
//        if (!firstChild) {
//          root.appendChild(content[0]);
//        }
//        else {
//          diff.element(firstChild, content[0]);
//        }
//      }
//    }
//  },
//
//  remove: function() {}
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

    var router = this;

    this.on('route', function(name) {
      this.stopListening();

      var router = this;
      this.container.$el.removeClass().addClass(name.split('P').join('-p'));
      this.container.setView(this.page).render();
    });
  },

  homePage: function() {
    this.page = HomePage.create();
  },

  repositoryPage: function() {
    if (!this.params.branch) {
      return this.navigate(WebApp.history.fragment + '/~workdir/tree/', true);
    }

    this.page = RepositoryPage.create(this.params);

    this.page.setView('.outlet', FileList.create({
      collection: this.page.collection,
      model: this.page.model
    }));

    var repositoryPage = this.page;

    this.page.model.fetch().then(function() {
      repositoryPage.collection.fetch();
    });
  },

  commitsPage: function() {
    this.page = CommitsPage.create(this.params);
  },

  filePage: function() {
    this.page = FilePage.create(this.params);

    var model = this.page.model;

    this.page.model.fetch().then(function() {
      model.file.fetch();
    });
  },

  treePage: function() {
    var repositoryPage = RepositoryPage.create(this.params);
    this.page = repositoryPage;

    repositoryPage.setView('.outlet', FileList.create({
      collection: repositoryPage.collection,
      model: repositoryPage.model
    }));

    this.listenTo(this.page.collection.repo, 'change', function() {
      console.log('here');
    });

    this.page.model.fetch().then(function() {
      repositoryPage.model.set('branch', repositoryPage.branch);
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
