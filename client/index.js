'use strict';

import Falcor from 'falcor';
import FalcorHttpDataSource from 'falcor-http-datasource';
import WebApp from 'webapp';
import { $, _ } from 'webapp';

// Import all pages.
import HomePage from './pages/home/home';
import RepositoryPage from './pages/repository/repository';
import CommitsPage from './pages/commits/commits';
import FilePage from './pages/file/file';
import FileList from './components/file-list/file-list';

import { enableProllyfill } from 'diffhtml';

// Opt into the experimental DOM API extensions.
enableProllyfill();

// Opt into using the WebWorker to calculate changes.
document.ENABLE_WORKER = false;

// Create the application.
const application = WebApp.create({ root: '/' });

// Create a single model for the entire application.
const model = new Falcor.Model({ source: new FalcorHttpDataSource('/api') });

// Set up the route states.
WebApp.Router.create({
  routes: {
    '': 'homePage',
    'repository/:repo': 'repositoryPage',
    'repository/:repo/:branch/commits': 'commitsPage',
    'repository/:repo/:branch/blob/*file': 'filePage',
    'repository/:repo/:branch/tree/*path': 'treePage'
  },

  homePage()       { HomePage.create(this.params); },
  repositoryPage() { RepositoryPage.create(this.params); },
  commitsPage()    { CommitsPage.create(this.params); },
  filePage()       { FilePage.create(this.params).refreshData(); },

  treePage() {
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
  var root = location.protocol + "//" + location.host + application.root;

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
application.start({ pushState: true });