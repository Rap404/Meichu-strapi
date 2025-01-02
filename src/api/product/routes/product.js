'use strict';

const middlewares = require('../../../../config/middlewares');

/**
 * product router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::product.product', {
  config: {
    find: {
      middlewares: ['api::product.products-populate'],
    },
    findOne: {
      middlewares: ['api::product.products-populate'],
    },
    update: {
      middlewares: ['api::product.products-populate'],
    },
    delete: {
      middlewares: ['api::product.products-populate'],
    }
  }
});
