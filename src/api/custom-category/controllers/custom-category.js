'use strict';

/**
 * custom-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::custom-category.custom-category', ({strapi}) => ({

  async create(ctx){
    try {
      const { name, isBundle } = ctx.request.body.data;
      const uuid = uuidv4();

      if (!name) {
        return ctx.badRequest('Missing required fields');
      }

      const entry = await strapi.entityService.create('api::custom-category.custom-category', {
        data: {
          uuid,
          name,
          isBundle,
          publishedAt: new Date()
        }
      })

      return this.transformResponse(entry);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async find(ctx) {
      const entities = await strapi.entityService.findMany('api::custom-category.custom-category', {
        ...ctx.query,
      });

      return this.transformResponse(entities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info('Finding one with query:', JSON.stringify({
        where: { uuid: id },
      }));

      const entity = await strapi.db.query('api::custom-category.custom-category').findOne({
        where: { uuid: id },
        ...ctx.query,
      });

      if (!entity) {
        return ctx.notFound(`Event with uuid ${id} doesn't exist`);
      }

      return this.transformResponse(entity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  },

  async search(ctx){
    const { query } = ctx.request.query;

    if (!query) {
      return ctx.badRequest('Search query is required')
    }

    try {
      strapi.log.info(`Searching categories with query: ${query}`);

      const entities = await strapi.entityService.findMany('api::custom-category.custom-category', {
        filters: {
          $or: [
            {name: {$containsi: query}},
            {requests: { $containsi: query }}
          ]
        },
        ...ctx.query,
      });

      strapi.log.info(`Found ${entities.length} categories`)

      return this.transformResponse(entities);
    } catch (error){
      strapi.log.error('Error in categories search: ', error);
      return ctx.internalServerError("Internal server error during search")
    }
  },

  async update(ctx){
    const { id } = ctx.params;

    if (!id){
      return ctx.badRequest('Category uuid is required');
    }

    try {
      const data = ctx.request.body.data || {};

      console.log('data: ', data);

      // fetch existing custom-category
      const existingCategory = await strapi.db.query('api::custom-category.custom-category').findOne({
        where: { uuid: id }
      });

      if (!existingCategory){
        return ctx.notFound(`Category with uuid ${ id } not found`);
      }

      console.log(existingCategory);

      const updateData = {
        name: data.name,
        isBundle: data.isBundle,
        requests: data.requests,
      }

      console.log('updateData: ', updateData);

      const response = await strapi.db.query('api::custom-category.custom-category').update({
        where: { uuid: id },
        data: updateData
      })

      return this.transformResponse(response);
    } catch (error){
      console.error('Update error:', error);
      return ctx.badRequest('Error updating ambassador', { error: error.message });
    }
  },

  async delete(ctx){
    const { id } = ctx.params;

    if (!id){
      return ctx.badRequest('Category uuid is required');
    }

    try {
      const existingCategory = await strapi.db.query('api::custom-category.custom-category').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingCategory){
        return ctx.notFound(`Category with uuid ${id} not found`);
      }

      console.log('Existing custom-category: ', existingCategory);

      const response = await strapi.db.query('api::custom-category.custom-category').delete({
        where: { uuid: id }
      });

      return this.transformResponse(response);
    } catch (error) {
      console.error('Delete error:', error);
      return ctx.badRequest('Error deleting ambassador', { error: error.message });
    }
  }
}));
