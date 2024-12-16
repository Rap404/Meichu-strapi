'use strict';

/**
 * `categories-populate` middleware
 */

const populate = {
  populate: {
    products: true
  }
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    // strapi.log.info('In categories-populate middleware.', JSON.stringify(ctx.query.populate));

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    strapi.log.info(`Updated ctx.query: ${JSON.stringify(ctx.query)}`, JSON.stringify(ctx.query));
    await next();
  };
};
