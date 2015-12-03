var notifications = require('./background/notifications.js');
var Permissions = require('./background/permissions.js');
var config = require('./scripts/config.js');
var KeyController = require('./scripts/controllers/key.js');
var request = require('superagent');

var permissions = new Permissions({
  permissions: ['tabs'],
  origins: ['http://*/', 'https://*/']
});
var results = {};
var xhr = false;
var progress = 0;
var progressInterval = false;

/*
 * Split the notification title to get the timestamp and calculate the time since now in seconds
 */
var timeSinceShown = function(obj) {
  if (Object.keys(obj).length) {
    var time = Object.keys(obj)[0].split('-')[1];
    return (Date.now() - time) / 1000;
  } else {
    return 0;
  }
};

/*
 * Decide whether to close all notifications or to start getting new ones
 */
var closeOrInitNotifications = function(callback) {

  // Clear the any progress / error notifications
  notifications.clear.errorAndProgress(function() {

    // Get all the current notifications
    chrome.notifications.getAll(function(obj) {

      // Find out how many seconds first notification has been visible for
      var time = timeSinceShown(obj);

      // If the notifications have been there for over 25 seconds then Chrome will
      // have automatically dismissed them so they should definitely be cleared
      if (time >= 25) {
        notifications.clear.all(function() {});
      }

      // If there are many notifications in view, clear them
      if (time <= 25 && Object.keys(obj).length > 1) {
        notifications.clear.all(function() {});

      // Otherwise start the process of getting new notifications
      } else {
        if (xhr) { xhr.abort(); }
        notifications.show.progress();
        callback();
      }
    });
  });
};

/*
 * Open the URL of a news item when clicking a notification
 */
chrome.notifications.onClicked.addListener(function(notificationId) {
  var id = notificationId.split('-')[0];
  var result = results.filter(function(e) { return e.id == id; });
  if (result && result.length) {
    window.open(result[0].meta.url);
  }
});

/*
 * Register the context menu on install
 */
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: 'send-to-lateral',
    title: 'Give me 5',
    contexts: ['selection']
  });
});

/*
 * Trigger recommendations from context menu
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId !== 'send-to-lateral') {
    return;
  }
  closeOrInitNotifications(function() {
    getRecommendations('text', info.selectionText);
  });
});

// Handle AJAX response
var ifSuccessful = function(res, callback) {
  notifications.clear.all(function() {
    // If successs
    if (res.status === 200) {
      callback();

    // Otherwise handle error
    } else if (res.text) {
      var text = res.text;
      try {
        text = res.body['message'];
      } catch (e) {}
      notifications.show.error(text);
    }
  });
};

/*
 * Initiate AJAX request to get recommendations
 */
var getRecommendations = function(by, data, url) {
  url = typeof url !== 'undefined' ? url : false;
  var key = new KeyController;
  key.get(function(key) {
    // Get recommendations
    request
      .post(config.apiBase + 'documents/similar-to-text')
      .send({ text: data })
      .set('Subscription-Key', key)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        ifSuccessful(res, function() {
          // If urls are the same then remove the first rec
          if (res.body[0].url == url) { res.body.shift(); }

          // Map the first five results for /batch
          var data = res.body.slice(0, 5).map(function(item) {
            return {
              url: '/documents/' + item.id,
              method: 'get',
              headers: { 'Subscription-Key': key }
            };
          });

          // Get the meta for each document using /batch
          request
            .post(config.apiBase + 'batch')
            .send({ ops: data, sequential: true })
            .set('Subscription-Key', key)
            .set('Accept', 'application/json')
            .end(function(err, res) {
              ifSuccessful(res, function() {
                // Show notifications
                results = res.body.results.map(function(item) { return item.body; });
                notifications.show.recommendations(results);
              });
            });
        });
      });
  });
};

/*
 * On keyboard shortcut. Check permissions and recommend
 */
chrome.commands.onCommand.addListener(function() {

  // Check the optional permissions have been set
  permissions.check(function() {

    // Close notifications if already visible
    closeOrInitNotifications(function() {

      // Get the current tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

        if (!tabs[0] || !tabs[0].id) {
          notifications.clear.errorAndProgress(function() {
            var message = 'It\'s not possible to recommend from the current active window or tab';
            notifications.show.error(message);
          });
        } else {

          // Set the message responsder on the target page
          chrome.tabs.executeScript(tabs[0].id, { file: 'content.js' }, function() {

            if (chrome.runtime.lastError) {
              var message = chrome.runtime.lastError.message;
              notifications.clear.errorAndProgress(function() {
                notifications.show.error(message);
              });
              return;
            }

            // Wait for the response from the tab with the HTML
            chrome.tabs.sendMessage(tabs[0].id, { method: 'getText' }, function(response) {

              // Send the page source to getRecommendations
              if (response.method == 'getText') {
                getRecommendations('html', response.data, tabs[0].url);
              }

            });
          });
        }
      });
    });
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.method == 'htmlNotification' && request.html) {
    closeOrInitNotifications(function() {
      getRecommendations('html', request.html);
    });
  }
});
