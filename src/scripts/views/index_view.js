var $ = require('jquery');
var Backbone = require('backbone');
var config = require('../config.js');

module.exports = Backbone.View.extend({

  template: require('../templates/index.hbs'),

  className: 'index wrapper',

  events: {
    'click #give-me-5': 'gimmeFive',
    'click #settings': 'showSettings'
  },

  gimmeFive: function(e) {
    e.preventDefault();
    router.tabs.getHtml(function(html) {
      chrome.runtime.sendMessage({ method: 'htmlNotification', html: html });
      window.close();
    });
  },

  showSettings: function(e) {
    e.preventDefault();
    router.fadeTo(this.el, 'settings', 240, 226);
  },

  render: function() {
    $(this.el).html(this.template({ settings: config.key == null }));
  }

});
