var Deferred = require('deferred-js');
var async = require('async');

var Notifications = {};
var progressInterval = false;
var progress = 0;

/**
 * Closes a notification.
 * @param {string} key The ID of the notification.
 * @return {promise} A promise that resolves when the notification
 *     has been closed.
 */
function clearNotification(key) {
  var dfd = new Deferred();
  chrome.notifications.clear(key, function() { dfd.resolve(key); });
  return dfd.promise();
};

/**
 * Pad a number
 * Credit: http://stackoverflow.com/a/10073788
 */
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

Notifications.clear = {

  /**
   * Iterates over each active notification and clears them.
   * @param {function} callback
   */
  all: function(callback) {
    var dfd = new Deferred();
    var callbacks = [];

    chrome.notifications.getAll(function(obj) {
      Object.keys(obj).forEach(function(key) {
        callbacks.push(clearNotification(key));
      });

      Deferred.when(callbacks).done(callback);
    });
  },

  /**
   * Clears the error notification.
   * @param {function} callback
   */
  error: function(callback) {
    chrome.notifications.clear('lateral-error', function() {
      callback();
    });
  },

  /**
   * Clears the progress notification.
   * @param {function} callback
   */
  progress: function(callback) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    chrome.notifications.clear('lateral-progress', function() {
      callback();
    });
  },

  /**
   * Clears the progress and error notifications.
   * @param {function} callback
   */
  errorAndProgress: function(callback) {
    Notifications.clear.progress(function() {
      Notifications.clear.error(callback);
    });
  }

}

/**
 * Get a thumbnail image with xhr to prevent CSP errors.
 * @param {object} object The result object containing 'thumbnail'.
 * @param {function} callback
 * @return {blob} The image, returned to the callback function.
 */
function xhrThumbnail(object, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', object.thumbnail || 'icons/48.png');
  xhr.responseType = 'blob';
  xhr.onload = function() { callback(this.response); };
  xhr.send(null);
}

Notifications.show = {

  /**
   * Show an error notification.
   */
  error: function(error) {
    Notifications.clear.progress(function() {
      if (!error) {
        error = 'Unknown error';
      }
      chrome.notifications.create('lateral-error', {
        type: 'basic',
        title: 'Error loading results',
        message: error,
        iconUrl: 'images/notification-error.png',
        priority: 2
      }, function() {});
    });
  },

  /**
   * Show the progress notification and increment the progress bar.
   */
  progress: function() {
    progress = 0;

    // Open notification
    chrome.notifications.create('lateral-progress', {
      type: 'progress',
      title: 'Loading recommendations',
      message: '',
      progress: 0,
      iconUrl: 'images/loader-logo.png',
      priority: 2
    }, function() {});

    // Create the interval to increment progress bar
    progressInterval = setInterval(function() {
      progress++;
      if (progress === 100) { progress = 0; }
      chrome.notifications.update('lateral-progress', { progress: progress });
    }, 50);
  },

  /**
   * Show the recommendation notifications and increment the progress bar.
   */
  recommendations: function(results) {
    Notifications.clear.all(function() {
      async.eachSeries(results, function(v, done) {
        var date = new Date(Date.parse(v.meta.date));
        var dateString = '';
        if (date && date.getDate()) {
          var dd = pad(date.getDate(), 2);
          var mm = pad((date.getMonth() + 1), 2);
          var yy = date.getFullYear();
          var dateString = dd + '/' + mm + '/' + yy;
        }

        var buttons = [];
        if (results.indexOf(v) == 4) {
          buttons = [{ title: 'Close all notifications' }];
        }

        chrome.notifications.create(v.id + '-' + Date.now(), {
          buttons: buttons,
          type: 'basic',
          title: v.meta.title,
          message: '',
          contextMessage: dateString,
          iconUrl: (v.meta && v.meta.image) || 'images/loader-logo.png',
          priority: 2
        }, function() {
          done();
        });
      });
    });
  }
}

module.exports = Notifications;
