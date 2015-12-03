var $ = require('jquery');
var Backbone = require('backbone');
var User = require('../models/user');
// var StoriesCollection = require('../collections/stories');
Backbone.Marionette = require('backbone.marionette');

module.exports = Backbone.Marionette.Controller.extend({
  initialize: function() {
    // console.log('Initializing user controller');
  },

  check: function(callback) {
    var _this = this;

    if (!router.user) { router.loader.show(); }

    // Check for a userId in the local storage
    chrome.storage.sync.get('userId', function(data) {

      // If there is an existing userId saved
      if (!$.isEmptyObject(data)) {
        _this.loadUser(data.userId, callback);

      // There is no userId set so create one
      } else {
        _this.createUser(callback);
      }
    });
  },

  loadUser: function(userId, callback) {
    var _this = this;

    // Get the user data from the server
    var user = new User({ uid: userId });
    user.fetch().done(function(model) {

      // Load the data to the router
      _this.saveUserToRouter(user, callback);
    });
  },

  createUser: function(callback) {
    var _this = this;

    // Create a new user and save it
    var user = new User();
    user.save(null, {
      success: function(model, response) {

        // Load the data to the router
        _this.saveUserToRouter(model, callback);
      },
      error: function(model, response) {
        // alert('error saving user', response);
      }
    });
  },

  saveUserToRouter: function(model, callback) {
    router.user = model;
    // router.stories = new StoriesCollection(model.get('stories'));
    chrome.storage.sync.set({ userId: model.get('uid') }, function(data) {
      router.loader.hide();
      callback();
    });
  },
})

