'use strict';

/**
 * ambassador controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::ambassador.ambassador', ({strapi}) => ({

  async create(ctx){
    try {
      const { name, description, socmed_links, image } = ctx.request.body.data;
      const uuid = uuidv4();

      // // Validate required fields
      if (!name || !description || !socmed_links || !image) {
        return ctx.badRequest('Missing required fields');
      }

      const entry = await strapi.entityService.create('api::ambassador.ambassador', {
        data: {
          uuid,
          name,
          description,
          socmed_links,
          image,
          publishedAt: new Date()
        }
      })

      return this.transformResponse(entry);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async find(ctx) {
    strapi.log.info('Finding with query:', JSON.stringify(ctx.query));

    const entities = await strapi.entityService.findMany('api::ambassador.ambassador', {
      ...ctx.query,
    });

    const sanitizeEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizeEntities);
  },

  async search(ctx){
    const { query } = ctx.request.query;

    if (!query) {
      return ctx.badRequest('Search query is required')
    }

    try {
      strapi.log.info('Searching ambassadors with query:', query);

      const filters = {
        $or: [
          { name: { $containsi: query } },
          { description: { $containsi: query } }
        ]
      };

      const entities = await strapi.entityService.findMany('api::ambassador.ambassador', {
        filters,
        ...ctx.query,
      });
      strapi.log.info(`Found ${entities.length} ambassadors`);

      return this.transformResponse(entities, {
        filters: {
          query,
          appliedFilters: {
            name: query,
            description: query
          }
        }
      })
    } catch (error){
      strapi.log.error('Error in ambassadors search: ', error);
      return ctx.internalServerError("Internal server error during search")
    }
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info('Finding one with query:', JSON.stringify({
        where: { uuid: id },
        ...ctx.query
      }));

      const entity = await strapi.db.query('api::ambassador.ambassador').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!entity) {
        return ctx.notFound('Ambassador not found');
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
      return ctx.badRequest('Ambassador uuid is required');
    }

    try {
      const data = ctx.request.body.data || {};

      console.log('data: ',data);

      // fetch existing ambassador
      const existingAmbassador = await strapi.db.query('api::ambassador.ambassador').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingAmbassador) {
        return ctx.notFound(`Ambassador with uuid ${id} not found`);
      }

      console.log(`Existing ambassador: ${existingAmbassador}`);

      const updateData = {
        name: data.name,
        description: data.description,
        socmed_links: data.socmed_links,
      }

      if ('image' in data) {
        if (existingAmbassador.image) {
          try {
            await strapi.plugins.upload.services.upload.remove({
              id: existingAmbassador.image.id
            });
          } catch (error) {
            console.log('error removing image ambassador:', error);
          }
        }

        updateData.image  = data.image || null;
      }

      console.log('updateData: ',updateData);

      const response = await strapi.db.query('api::ambassador.ambassador').update({
        where: { uuid: id },
        data: updateData
      })

      console.log('response: ',response);

      return this.transformResponse(response);
    } catch (error) {
      console.error('Update error:', error);
      return ctx.badRequest('Error updating ambassador', { error: error.message });
    }
  },

  async delete(ctx){
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Ambassador uuid is required');
    }

    try {
      const existingAmbassador = await strapi.db.query('api::ambassador.ambassador').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingAmbassador) {
        return ctx.notFound(`Ambassador with uuid ${id} not found`);
      }

      console.log(existingAmbassador)

      if (existingAmbassador.image) {
        try {
          await strapi.plugins.upload.services.upload.remove({
            id: existingAmbassador.image.id
          });
        } catch (error) {
          console.log('error removing image ambassador:', error);
        }
      }

      const response = await strapi.db.query('api::ambassador.ambassador').delete({
        where: { uuid: id }
      });

      return this.transformResponse(response);
    } catch (error) {
      console.error('Delete error:', error);
      return ctx.badRequest('Error deleting ambassador', { error: error.message });
    }
  },
}));
