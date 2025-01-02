'use strict';

/**
 * `requests-populate` middleware
 */

const populate = {
    references: true,
    user: {
      select: ['id', 'username', 'email']
    }
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info('In requests-populate middleware.');


if (!ctx.query.populate) {
  ctx.query.populate = populate
}
    await next();
  };
};
