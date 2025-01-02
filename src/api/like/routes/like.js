'use strict';

/**
 * like router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::like.like', {
  config: {
    find: {
      middlewares: ['api::like.like-populate'],
    },
    findOne: {
      middlewares: ['api::like.like-populate'],
    },
  }
});
