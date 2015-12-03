var $ = require('jquery');
var Backbone = require('backbone');
Backbone.Marionette = require('backbone.marionette');
var Router = require('./routers/root_router');
var config = require('./config.js');

window.App = new Backbone.Marionette.Application();

App.addRegions({
  'wrapper': '#wrapper',
  'loader': '#loader',
  'error': '#error',
});

if (!config.key) {
  document.body.className = 'settings';
}

$(function() {
  // For keyboard shortcut display
  if (navigator.userAgent.indexOf('Mac OS X') != -1) {
    $('body').addClass('mac');
  } else {
    $('body').addClass('pc');
  }

  // Init app
  window.router = new Router();
  Backbone.history.start();

});
