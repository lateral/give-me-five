var $ = require('jquery');
var Backbone = require('backbone');
Backbone.Marionette = require('backbone.marionette');

module.exports = Backbone.Marionette.Controller.extend({
  initialize: function(app) {
    this.app = app;
  },

  show: function() {
    $(this.app.loader.el).fadeIn(200);
  },

  hide: function() {
    $(this.app.loader.el).fadeOut(200);
  }
})

