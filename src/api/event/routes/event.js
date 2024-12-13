'use strict';

const middlewares = require('../../../../config/middlewares');

/**
 * event router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::event.event', {
  config: {
    find: {
      middlewares: ['api::event.events-populate'],
    },
    findOne: {
      middlewares: ['api::event.events-populate'],
    }
  }
});
