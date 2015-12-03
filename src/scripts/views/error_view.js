var $ = require('jquery');
var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  template: require('../templates/error.hbs'),

  className: 'wrapper',

  events: {
    'click .button': 'dismiss'
  },

  initialize: function(message) {
    this.message = message
  },

  dismiss: function() {
    router.error.hide();
  },

  render: function() {
    $(this.el).html(this.template({ message: this.message }));
  }

});
