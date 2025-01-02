'use strict';

/**
 * ambassador router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::ambassador.ambassador', {
  config: {
    find: {
      middlewares: ['api::ambassador.ambassador-populate'],
    },
    findOne: {
      middlewares: ['api::ambassador.ambassador-populate'],
    },
    update: {
      middlewares: ['api::ambassador.ambassador-populate'],
    },
    delete: {
      middlewares: ['api::ambassador.ambassador-populate'],
    }
  }
});
