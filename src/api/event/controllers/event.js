'use strict';

/**
 * event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({strapi}) => ({

  async find(ctx) {
    const contentType = strapi.contentType('api::event.event');

    // Log untuk debugging
    strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::event.event', {
      ...ctx.query,
      populate: {
        image_cover: {
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
          image_cover: {
            fields: ['name', 'alternativeText', 'url', 'formats']
          }
        }
      }));

      const entity = await strapi.db.query('api::event.event').findOne({
        where: { uuid: id },
        populate: {
          image_cover: {
            fields: ['name', 'alternativeText', 'url', 'formats']
          }
        }
      });

      if (!entity) {
        return ctx.notFound('Event not found');
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      if(sanitizedEntity.image_cover) {
        sanitizedEntity.image_cover = {
          url: sanitizedEntity.image_cover.url,
          name: sanitizedEntity.image_cover.name,
          alternativeText: sanitizedEntity.image_cover.alternativeText,
        }
      }

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  }
}));
