'use strict';

/**
 * `like-populate` middleware
 */

const populate = {
  user: true,
  product: true,
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In like-populate middleware.');

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    await next();
  };
};
