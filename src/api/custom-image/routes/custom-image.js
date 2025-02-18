'use strict';

/**
 * custom-image router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::custom-image.custom-image', {

  config: {
    find: {
      middlewares: ['api::banner-image.banners-populate'],
    },
    findOne: {
      middlewares: ['api::banner-image.banners-populate'],
    },
    update: {
      middlewares: ['api::banner-image.banners-populate'],
    },
    delete: {
      middlewares: ['api::banner-image.banners-populate'],
    }
  }
});
