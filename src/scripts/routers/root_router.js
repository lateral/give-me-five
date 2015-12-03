var $ = require('jquery');
var Backbone = require('backbone');

var IndexView = require('../views/index_view');
var SettingsView = require('../views/settings_view');
var KeyController = require('../controllers/key');
var TabsController = require('../controllers/tabs');
var LoaderController = require('../controllers/loader');
var ErrorController = require('../controllers/error');
var config = require('../config.js');

module.exports = Backbone.Router.extend({

  routes: {
    'settings': 'settings',
    '*path': 'index'
  },

  initialize: function(options) {
    this.key = new KeyController;
    this.tabs = new TabsController;
    this.loader = new LoaderController(App);
    this.error = new ErrorController(App);
    this.bind('all', this._trackPageview);
  },

  index: function() {
    App.wrapper.show(new IndexView());
  },

  settings: function() {
    App.wrapper.show(new SettingsView());
  },

  fadeTo: function(el, path, width, height) {
    $(el).animate({ opacity: 0 }, 100, function() {
      router.navigate(path, { trigger: true });
    });
  }
});
