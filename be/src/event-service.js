'use strict';
const config = require('../config').getCurrent();
const request = require('request');
const logger = require('./logger');

module.exports = {
  sendEvent: function (name, idUser, props, userProps) {
    var apiKey = config.amplitudeApiKey;
    if (!apiKey) {
      logger.warn('[no event key] ! ', name, idUser);
      return;
    }

    if (!idUser) idUser = 'workcycle-app';

    // userID is required, since we don't have device information
    var eventData = {
      user_id: idUser,
      event_type: name
    };

    if (props) {
      eventData.event_properties = props;
    }
    if (userProps) {
      eventData.user_properties = userProps;
    }

    //todo: send event to your service of choice!

  }};
