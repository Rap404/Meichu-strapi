'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({strapi}) => ({

  async find(ctx) {
    const contentType = strapi.contentType('api::product.product');

    // Log untuk debugging
    strapi.log.info('Finding with query: ', JSON.stringify(ctx.query))

    const entities = await strapi.entityService.findMany('api::product.product', {
      ...ctx.query,
      populate: {
        thumbnail: {
          fields: ['name', 'url', 'alternativeText']
        },
        images: {
          fields: ['name', 'url', 'alternativeText']
        },
        likes: true,
        category: true
      }
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);

    return this.transformResponse(sanitizeEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info("Finding one with query ", JSON.stringify({
        where:  { uuid: id },
        populate: {
          thumbnail: {
            fields: ['name', 'url', 'alternativeText']
          },
          images: {
            fields: ['name', 'url', 'alternativeText']
          },
          likes: true,
          category: true,
        }
      }));

      const entity = await strapi.db.query('api::product.product').findOne({
        where: { uuid: id },
        populate: {
          thumbnail: {
            fields: ['name', 'url', 'alternativeText']
          },
          images: {
            image: {
              populate: true,
              fields: ['name', 'url', 'alternativeText']
            }
          },
          likes: true,
          category: true,
        }
      });

      if(!entity) {
        return ctx.notFound('Product not found');
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

      if(sanitizedEntity.thumbnail) {
        sanitizedEntity.thumbnail = {
          url: sanitizedEntity.thumbnail.url,
          name: sanitizedEntity.thumbnail.name,
          alternativeText: sanitizedEntity.thumbnail.alternativeText,
        }
      }

      if (sanitizedEntity.images) {
        sanitizedEntity.images = sanitizedEntity.images.map(image => {
          if(image) {
            image = {
              url: image.url,
              name: image.name,
              alternativeText: image.alternativeText
            }
          }
          return image;
        })
      }

      return this.transformResponse(sanitizedEntity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError('Internal Server Error');
    }
  }
}));
