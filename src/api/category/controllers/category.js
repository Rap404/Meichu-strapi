'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({strapi}) => ({
  async find(ctx) {
    const contentType = strapi.contentType('api::category.category');
    strapi.log.info(`Controller function find - ctx.query: ${JSON.stringify(ctx.query)}`);


    // Log untuk debugging
    // strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::category.category', {
      ...ctx.query,
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizeEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info(`Controller function findOne - ctx.query: ${JSON.stringify(ctx.query)}`);

      strapi.log.info('Finding one with query:', JSON.stringify({
        where: { uuid: id },
      }));

      const entity = await strapi.db.query('api::category.category').findOne({
        where: { uuid: id },
        ...ctx.query,
      });

      if (!entity) {
        return ctx.notFound(`Event not ketemu ${id}`);
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  },

  async search(ctx) {
    const { query } = ctx.request.query;

    if (!query) {
      return ctx.badRequest('Search query is required')
    }

    try {
      strapi.log.info('Searching categories with query:', query);
      strapi.log.info('Controller search triggered - ctx.query:', JSON.stringify(ctx.query));


      const entities = await strapi.entityService.findMany('api::category.category', {
        filters: {
          $or: [
            {name: { $containsi: query }},
            {description: { $containsi: query }}
          ]
        },
        ...ctx.query,
      });
      strapi.log.info(`Found ${entities.length} categories`);

      const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
      return this.transformResponse(sanitizedEntities);

    } catch (error) {
      strapi.log.error('Error in category search:', error);
      return ctx.internalServerError("Internal server error during search");
    }
  }
}) );
