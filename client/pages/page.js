'use strict';

import WebApp from 'webapp';

export default WebApp.View.extend({
  el: document.documentElement,

  fetchTemplate(template) {
    return template.render.bind(template);
  },

  renderTemplate(render, data) {
    this.el.diffOuterHTML = render(data);
  }
});
