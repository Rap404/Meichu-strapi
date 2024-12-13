'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({strapi}) => ({
  async find(ctx) {
    const contentType = strapi.contentType('api::category.category');

    // Log untuk debugging
    strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::category.category', {
      ...ctx.query,
      populate: {
        products: true,
      }
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizeEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info('Finding one with query:', JSON.stringify({
        where: { uuid: id },
        populate: {
          products: true,
        }
      }));

      const entity = await strapi.db.query('api::category.category').findOne({
        where: { uuid: id },
        populate: {
          products: true,
        }
      });

      if (!entity) {
        return ctx.notFound('Event not found');
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  }
}) );
