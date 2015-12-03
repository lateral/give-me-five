var $ = require('jquery');
var Backbone = require('backbone');
Backbone.Marionette = require('backbone.marionette');

module.exports = Backbone.Marionette.Controller.extend({

  getUrl: function(callback) {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      callback(tabs[0].url);
    });
  },

  getHtml: function(callback) {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      // Set the message responsder on the target page
      chrome.tabs.executeScript(tabs[0].id, { file: 'content.js' }, function() {

        // Wait for the response from the tab with the HTML
        chrome.tabs.sendMessage(tabs[0].id, { method: 'getText' }, function(response) {

          // Send the page source to getRecommendations
          if (response.method == 'getText') {
            callback(response.data);
          }

        });
      });
    });
  }
})

