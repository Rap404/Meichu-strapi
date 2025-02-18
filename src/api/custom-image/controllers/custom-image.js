'use strict';

/**
 * custom-image controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::custom-image.custom-image', ({strapi}) => ({

  async create(ctx){
    const {image} = ctx.request.body.data;
    const uuid = uuidv4();

    // Validate values
    if (!image) {
      return ctx.badRequest('Missing required fields');
    }

    try {
      const entry = await strapi.entityService.create('api::custom-image.custom-image', {
        data: {
          uuid,
          image,
          publishedAt: new Date()
        }
      });

      return this.transformResponse(entry);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async find(ctx) {
    strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::custom-image.custom-image', {
      ...ctx.query,
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizeEntities);
  },

  async findOne(ctx){
    const { id } = ctx.params;

    try {
      strapi.log.info('Finding one with id:', id);
      const entity = await strapi.db.query('api::custom-image.custom-image').findOne({
        where: { uuid: id },
        ...ctx.query,
      });

      if (!entity) {
        return ctx.notFound('image not found');
      }

      return this.transformResponse(entity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  },

  async update(ctx){
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('image uuid is required');
    }

    try {
      const data = ctx.request.body.data || {};

      console.log('data: ',data);

      // fetch existing
      const existingImage = await strapi.db.query('api::custom-image.custom-image').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingImage) {
        return ctx.notFound(`image with uuid ${id} not found`);
      }

      const updateData = {};

      if ('image' in data) {
        if (existingImage.image) {
          try {
            await strapi.plugins.upload.services.upload.remove({
              id: existingImage.image.id
            });
          } catch (error) {
            console.log('error removing image :', error);
          }
        }

        updateData.image = data.image || null;
      }

      const response = await strapi.db.query('api::custom-image.custom-image').update({
        where: { uuid: id },
        data: updateData
      })

      return this.transformResponse(response);
    } catch (error) {
      console.error('Update error:', error);
      return ctx.badRequest('Error updating image custom', { error: error.message });
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Image uuid is required');
    }

    try {
      const existingImage = await strapi.db.query('api::custom-image.custom-image').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingImage) {
        return ctx.notFound(`Image with uuid ${id} not found`);
      }

      if (existingImage.image) {
        try {
          await strapi.plugins.upload.services.upload.remove({
            id: existingImage.image.id
          });
        } catch (error) {
          console.log('error removing image :', error);
        }
      }

      const response = await strapi.db.query('api::custom-image.custom-image').delete({
        where: { uuid: id },
      });

      return this.transformResponse(response);
    } catch (error) {
      console.error('Delete error:', error);
      return ctx.badRequest('Error deleting image custom', { error: error.message });
    }
  }
}));
