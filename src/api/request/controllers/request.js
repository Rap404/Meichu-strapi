'use strict';

/**
 * request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::request.request', ({ strapi }) => ({

  async find(ctx) {
    const contentType = strapi.contentType('api::request.request');

    // Log untuk debugging
    strapi.log.info('Finding with query: ', JSON.stringify(ctx.query))

    const entities = await strapi.entityService.findMany('api::request.request', {
      ...ctx.query,
      populate: {
        references: {
          fields: ['name', 'url', 'alternativeText']
        },
        user: {
          select: ['id', 'username', 'email']
        }
      }
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizeEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info("Finding one with query ", JSON.stringify({
        where: { uuid: id },
        populate: {
          references: {
            fields: ['name', 'url', 'alternativeText']
          },
          user: {
            select: ['id', 'username', 'email']
          }
        }
      }));

      const entity = await strapi.db.query('api::request.request').findOne({
        where: { uuid: id },
        populate: {
          references: {
            fields: ['name', 'url', 'alternativeText']
          },
          user: {
            select: ['id', 'username', 'email']
          },
        }
      });

      if (!entity) {
        return ctx.notFound('Product not found');
      }

      strapi.log.info('FindOne Params:', JSON.stringify(ctx.params));
      strapi.log.info('findOne Query: ', JSON.stringify(ctx.query));

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Detailed error fetching entity: ', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return ctx.internalServerError('Internal Server Error');
    }
  }
}));
