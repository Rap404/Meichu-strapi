'use strict';

const middlewares = require('../../../../config/middlewares');

/**
 * request router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::request.request', {
  config: {
    find: {
      middlewares: ['api::request.requests-populate'],
    },
    findOne: {
      middlewares: ['api::request.requests-populate'],
    }
  }
});
