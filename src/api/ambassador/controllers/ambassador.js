'use strict';

/**
 * ambassador controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ambassador.ambassador', ({strapi}) => ({

  async find(ctx) {
    const contentType = strapi.contentType('api::ambassador.ambassador');

    // Log untuk debugging
    strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::ambassador.ambassador', {
      ...ctx.query,
      populate: {
        image: {
          fields: ['name', 'alternativeText', 'url']
        }
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
          image: {
            fields: ['name', 'alternativeText', 'url', 'formats']
          }
        }
      }));

      const entity = await strapi.db.query('api::ambassador.ambassador').findOne({
        where: { uuid: id },
        populate: {
          image: {
            fields: ['name', 'alternativeText', 'url', 'formats']
          }
        }
      });

      if (!entity) {
        return ctx.notFound('Ambassador not found');
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      if(sanitizedEntity.image) {
        sanitizedEntity.image = {
          url: sanitizedEntity.image.url,
          name: sanitizedEntity.image.name,
          alternativeText: sanitizedEntity.image.alternativeText,
        }
      }

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  }
}));
