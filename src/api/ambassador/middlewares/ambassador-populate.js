'use strict';

/**
 * `ambassador-populate` middleware
 */

const populate= {
  populate: {
    image: {
      fields: ['name', 'alternativeText', 'url']
    }
  }
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In ambassador-populate middleware.');

    if(!ctx.query.populate) {
      ctx.query.populate = populate
    }

    strapi.log.info('Updated ctx.query: ', JSON.stringify(ctx.query));

    await next();
  };
};
