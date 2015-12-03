var $ = require('jquery');
var Backbone = require('backbone');
var ErrorView = require('../views/error_view');
Backbone.Marionette = require('backbone.marionette');

module.exports = Backbone.Marionette.Controller.extend({
  initialize: function(app) {
    this.app = app;
  },

  show: function(message) {
    this.app.error.show(new ErrorView(message));
    $(this.app.error.el).fadeIn(200);
  },

  hide: function() {
    $(this.app.error.el).fadeOut(200);
    this.app.error.close();
  }
})

