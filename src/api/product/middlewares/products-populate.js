'use strict';

/**
 * `products-populate` middleware
 */

const populate = {
  populate: {
    thumbnail: {
      fields: ['name', 'alternativeText', 'url']
    },
    images: {
      image: {
        populate: true,
        fields: ['name', 'url', 'alternativeText']
      }
    },
    likes: true,
    category: true,
  }
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
