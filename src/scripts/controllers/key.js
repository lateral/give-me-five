var $ = require('jquery');
var Backbone = require('backbone');
Backbone.Marionette = require('backbone.marionette');
var config = require('../config.js');

module.exports = Backbone.Marionette.Controller.extend({
  initialize: function() {
    // console.log('Initializing user controller');
  },

  // If key is in config then return that
  // otherwise look in storage for it

  get: function(callback) {
    if (config.key !== null) {
      callback(config.key);
    } else {
      // Check for a key in the local storage
      chrome.storage.sync.get('key', function(data) {
        callback(data.key);
        // // If there is an existing key
        // if (!$.isEmptyObject(data)) {

        // }
      });
    }
  },

  set: function(key, callback) {
    chrome.storage.sync.set({ key: key }, function() {
      callback();
    });
  }

  // loadUser: function(userId, callback) {
  //   var _this = this;

  //   // Get the user data from the server
  //   var user = new User({ uid: userId });
  //   user.fetch().done(function(model) {

  //     // Load the data to the router
  //     _this.saveUserToRouter(user, callback);
  //   });
  // },

  // createUser: function(callback) {
  //   var _this = this;

  //   // Create a new user and save it
  //   var user = new User();
  //   user.save(null, {
  //     success: function(model, response) {

  //       // Load the data to the router
  //       _this.saveUserToRouter(model, callback);
  //     },
  //     error: function(model, response) {
  //       // alert('error saving user', response);
  //     }
  //   });
  // },

  // saveUserToRouter: function(model, callback) {
  //   router.user = model;
  //   // router.stories = new StoriesCollection(model.get('stories'));
  //   chrome.storage.sync.set({ userId: model.get('uid') }, function(data) {
  //     router.loader.hide();
  //     callback();
  //   });
  // },
})

