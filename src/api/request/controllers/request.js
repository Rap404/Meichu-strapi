'use strict';

/**
 * request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::request.request', ({ strapi }) => ({

  async create(ctx){
    try {
      const { name, productType, references, imvu, user, custom_categories } = ctx.request.body.data;
      const uuid = uuidv4();
      const categories = [];

      strapi.log.info(custom_categories)

      if (!name || !productType || !references || !user){
        return ctx.badRequest('Missing required fields')
      }

      if (custom_categories) {
        for (const cat of custom_categories) {
          const entity = await strapi.db.query('api::custom-category.custom-category').findOne({
            where: { uuid: cat },
          });
          categories.push(entity.id);
        }
      }

      const entry = await strapi.entityService.create('api::request.request', {
        data: {
          uuid,
          name,
          productType,
          references,
          imvu,
          user,
          custom_categories: categories,
          publishedAt: new Date()
        }
      })

      return this.transformResponse(entry)
    } catch (error) {
      return ctx.badRequest(error.message)
    }
  },

  async find(ctx){
    // Log untuk debugging
    strapi.log.info('Finding with query: ', JSON.stringify(ctx.query))

    const entities = await strapi.entityService.findMany('api::request.request', {
      ...ctx.query,
    });

    return this.transformResponse(entities);
  },

  async findOne(ctx){
    const { id } = ctx.params;

    try {
      strapi.log.info("Finding one with query ", JSON.stringify({
        where: { uuid: id },
        ...ctx.query
      }));

      const entity = await strapi.db.query('api::request.request').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!entity) {
        return ctx.notFound('Request not found');
      }

      return this.transformResponse(entity);
    } catch (error) {
      strapi.log.error('Detailed error fetching entity: ', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return ctx.internalServerError('Internal Server Error');
    }
  },

  async search(ctx){
    const { query } = ctx.request.query;

    if (!query){
      return ctx.badRequest('search query is required');
    }

    try{
      strapi.log.info(`Searching request with query: ${query}`);

      const entities  = await strapi.entityService.findMany('api::request.request', {
        filters: {
          $or: [
            { name: { $containsi: query } }
          ]
        },
        ...ctx.query,
      });

      console.log(entities);

      strapi.log.info(`Found ${entities.length} products`);

      return this.transformResponse(entities)
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError('Internal server error');
    }
  },

  async update(ctx){
    const { id } = ctx.params;

    if (!id){
      return ctx.badRequest('Request uuid is required');
    }

    try{
      const data = ctx.request.body.data || {};

      // fetch existing event
      const existingRequest = await strapi.db.query('api::request.request').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingRequest){
        return ctx.notFound(`Event with uuid ${id} is not found`);
      }

      console.log('existing request:', existingRequest);

      const updateData = {
        name: data.name,
        productType: data.productType,
        imvu: data.imvu,
        isNew: data.isNew,
      }

      if ('custom_categories' in data) {
        let categories = [];
        for (const cat of data.custom_categories) {
          const entity = await strapi.db.query('api::custom-category.custom-category').findOne({
            where: { uuid: cat },
          });
          categories.push(entity.id);
        }

        if (categories.length > 0) {
          updateData.custom_categories = categories;
        } else {
          return ctx.badRequest(`Custom categories with uuid ${data.custom_categories} not found`);
        }
      }

      if ('references' in data){
        try{
          await strapi.plugins.upload.services.upload.remove({
            id: existingRequest.references.id
          });

        } catch (error){
          console.log('Error removing references: ', error)
        }

        const referencesExists = await strapi.db.query('plugin::upload.file').findOne({
          where: { id: data.references }
        });

        if(referencesExists){
          updateData.references = data.references;
        } else {
          console.log(`Refrences with ID ${ data.references } not found`);
        }
      }

      const response = await strapi.db.query('api::request.request').update({
        where: { uuid: id },
        data: updateData,
        ...ctx.query
      });

      return this.transformResponse(response)
    } catch (error){
      console.error('Update error: ', error);
      return ctx.badRequest('Update failed', { error: error.message })
    }
  },

  async delete(ctx){
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Request uuid is required');
    }

    try{
      const existingRequest = await strapi.db.query('api::request.request').findOne({
        where: { uuid: id },
        populate: {
          references: true
        }
      });

      if(!existingRequest){
        return ctx.notFound(`Request with uuid ${id} is not found`);
      }

      console.log(existingRequest)

      if(existingRequest){
        try{
          await strapi.plugins.upload.services.upload.remove({ id: existingRequest.references.id });
        } catch (error) {
          console.log('error removing references', error);
        }
      }

      const response = await strapi.db.query('api::request.request').delete({
        where: { uuid: id },
      })

      return this.transformResponse(response);
    } catch (error) {
      console.error('Delete Error', error);
      return ctx.badRequest('Error deleting request', { error: error.message })
    }
  }
}));
