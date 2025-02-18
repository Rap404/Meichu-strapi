'use strict';

/**
 * `custom-category-populate` middleware
 */

const populate = {
  requests: true
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In custom-category-populate middleware.');

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    await next();
  };
};
