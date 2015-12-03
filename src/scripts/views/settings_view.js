var $ = require('jquery');
var Backbone = require('backbone');
Backbone.Marionette = require('backbone.marionette');

module.exports = Backbone.Marionette.View.extend({

  template: require('../templates/settings.hbs'),

  className: 'settings wrapper',

  events: {
    'click .back': 'showIndex',
    'click .button': 'submit',
    'keypress #key-input': 'checkEnter'
  },

  showIndex: function(e) {
    e.preventDefault();
    router.fadeTo(this.el, '/', 240, 226);
  },

  checkEnter: function(e) {
    if (e.keyCode == 13) { this.submit(); }
  },

  submit: function(e) {
    var _this = this;
    router.key.set($('#key-input').val(), function() {
      _this.$('.button').html('Saved').removeClass('loading').addClass('saved');
      setTimeout(function() {
        _this.render();
      }.bind(_this), 2000);
    });
  },

  render: function() {
    var that = this;
    router.key.get(function(key) {
      $(that.el).html(that.template({ key: key }));
    })
  }
});
