'use strict';

/**
 * `events-populate` middleware
 */

  const populate = {
    populate: {
      image_cover: {
        fields: ['name', 'alternativeText', 'url']
      }
    }
  }

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In events-populate middleware.');

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    strapi.log.info('Updated ctx.query: ', JSON.stringify(ctx.query));

    await next();
  };
};