'use strict';

/**
 * custom-category router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::custom-category.custom-category', {
  config: {
    find: {
      middlewares: ['api::custom-category.custom-category-populate'],
    },
    findOne: {
      middlewares: ['api::custom-category.custom-category-populate'],
    },
    delete: {
      middlewares: ['api::custom-category.custom-category-populate'],
    }
  }
});
