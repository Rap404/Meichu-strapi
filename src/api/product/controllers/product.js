'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize } = require('@strapi/utils');
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::product.product', ({strapi}) => ({

  async create (ctx){
    try{
      const { name, categories, thumbnail, images, description, price, product_link } = ctx.request.body.data;
      const uuid = uuidv4();

      if (!name || !description || !price || !product_link){
        return ctx.badRequest('Missing required fields');
      }

      const entry = await strapi.entityService.create('api::product.product',{
        data: {
          uuid,
          name,
          categories,
          thumbnail,
          images,
          description,
          price,
          product_link,
          publishedAt: new Date()
        }
      });

      return this.transformResponse(entry);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async find(ctx){
    strapi.log.info('Finding with query: ', JSON.stringify(ctx.query))

    const entities = await strapi.entityService.findMany('api::product.product', {
      ...ctx.query,
    });

    return this.transformResponse(entities);
  },

  async findOne(ctx){
    const { id } = ctx.params;

    try {
      const entity = await strapi.db.query('api::product.product').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if(!entity) {
        return ctx.notFound('Product not found');
      }

      return this.transformResponse(entity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError('Internal Server Error');
    }
  },

  async search(ctx){
    const { query } = ctx.request.query;

    if (!query) {
      return ctx.badRequest('Search query is required');
    }

    try {
      strapi.log.info(`Searching products with query: ${query}`);

      const entities = await strapi.entityService.findMany('api::product.product', {
        filters: {
          $or: [
            { name: { $containsi: query } },
            { description: { $containsi: query } }
          ]
        },
        ...ctx.query,
      });

      console.log(entities);

      strapi.log.info(`Found ${entities.length} products`);

      return this.transformResponse(entities);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError('Internal server error');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const data = ctx.request.body.data || {};

      console.log('Received data:', data);

      const existingProduct = await strapi.db.query('api::product.product').findOne({
        where: { uuid: id},
        ...ctx.query
      })

      if (!existingProduct) {
        return ctx.notFound(`Product with uuid ${id} is not found`);
      }

      console.log('Existing product:', existingProduct); // Debug log

      // Prepare update data
      const updateData = {
        name: data.name,
        description: data.description,
        price: data.price,
        product_link: data.product_link,
      };

      if (data.categories){
        updateData.categories = {
          set: Array.isArray(data.categories) ? data.categories : [data.categories]
        }
      }

      // // Handle thumbnail safely
      if ('thumbnail' in data) {
          try {
            await strapi.plugins.upload.services.upload.remove({
              id: existingProduct.thumbnail.id
            });

          } catch (err) {
            console.log('Error removing thumbnail:', err);
          }

          const thumbnailExist = await strapi.db.query('plugin::upload.file').findOne({
            where: { id: data.thumbnail }
          });

          if (thumbnailExist) {
            updateData.thumbnail = data.thumbnail;
          } else {
            console.log(`Thumbnail with ID ${ data.thumbnail } not found`);
          }
      }

      // // Handle images safely
      if ('images' in data) {
        const existingImageIds = existingProduct.images?.map(img => img.id) || [];
        const newImageIds = Array.isArray(data.images) ? data.images : [];

        // Verify all new images IDs exist
        const validImagesIds = await strapi.db.query('plugin::upload.file').findMany({
          where: { id: { $in: newImageIds } }
        });

        const validIds = validImagesIds.map(img => img.id);

        // Remove images that are no longer needed

        const imagesToDelete = existingImageIds.filter(id => !newImageIds.includes(id));
        for (const imageId of imagesToDelete) {
          try {
            await strapi.plugins.upload.services.upload.remove({
              id: imageId
            });
          } catch (err) {
            console.log('Error removing image:', err);
          }
        }

        updateData.images = newImageIds;
      }

      const response = await strapi.db.query('api::product.product').update({
        where: { uuid: id },
        data: updateData,
        populate: {
          thumbnail: true,
          images: true,
          categories: true
        }
      })

      console.log('response', response)

      return this.transformResponse(response)
    } catch (error) {
      console.error('Update error:', error);
      return ctx.badRequest('Update failed', { error: error.message });
    }
  },

  async delete(ctx){
    const { id } = ctx.params;

    if (!id){
      return ctx.badRequest('Products uuid is required');
    }

    try {
      const existingProduct = await strapi.db.query('api::product.product').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingProduct){
        return ctx.notFound(`Product with uuid ${ id } is not found`);
      }

      console.log('existing product', existingProduct)

        if (existingProduct.thumbnail?.id){
          try {
            await strapi.plugins.upload.services.upload.remove({ id: existingProduct.thumbnail.id });
          } catch (error) {
            console.log('error removing thumbnail product', error);
          }
        }

        if (existingProduct.images && existingProduct.images.length > 0){
          // use promise.all to wait for all image deletions
          await Promise.all(
            existingProduct.images.map( async (image) => {
              if(image?.id) {
                try {
                  await strapi.plugins.upload.services.upload.remove({
                    id: image.id
                  })
                } catch (error) {
                  console.log(`error removing image ${image.id}: `,error)
                }
              }
            } )
          )
        };

      const response = await strapi.entityService.delete('api::product.product', existingProduct.id)

      return this.transformResponse(response)
    } catch (error) {
      console.error('Delete Error', error);
      return ctx.badRequest('Error deleting product', { error: error.message });
    }
  }
}));
