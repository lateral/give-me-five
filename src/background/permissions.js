function Permissions(permissions) {
  this.permissions = permissions;
}

Permissions.prototype.check = function(callback) {
  var permissions = this.permissions;

  chrome.permissions.contains(permissions, function(result) {
    if (result) {
      callback();
    } else {
      window.alert('We\'re about to ask for extended permissions so we can enable the Give me ' +
                   'five keyboard shortcut. Please click \'Allow\' on the following message ' +
                   'otherwise it won\'t work!');

      chrome.permissions.request(permissions, function(granted) {
        if (granted) {
          callback();
        } else {
          window.alert('Because you didn\'t allow the permissions the Give me five keyboard ' +
                       'shortcut won\'t work.');
        }
      });
    }
  });
};

/*
 * Remove the optional permissions
 */
Permissions.prototype.revoke = function() {
  chrome.permissions.remove(this.permissions, function(removed) {
    console.log('Removed: ' + removed);
  });
};

module.exports = Permissions;
