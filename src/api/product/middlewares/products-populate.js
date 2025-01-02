'use strict';

/**
 * `products-populate` middleware
 */

const populate = {
    thumbnail: true,
    images: {
      image: true,
    },
    likes: true,
    categories: true,
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In products-populate middleware.');

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    await next();
  };
};
