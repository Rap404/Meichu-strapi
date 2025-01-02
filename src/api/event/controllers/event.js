'use strict';

/**
 * event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::event.event', ({strapi}) => ({

  async create (ctx){
    try{
    const { name, image_cover, description, event_link, start_date, end_date } = ctx.request.body.data;
    const uuid = uuidv4();

    if (!name || !description || !event_link || !start_date || !end_date) {
      return ctx.badRequest('Missing required fields');
    }

    const entry = await strapi.entityService.create('api::event.event', {
      data: {
        uuid,
        name,
        image_cover,
        description,
        event_link,
        start_date,
        end_date,
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

    const entities = await strapi.entityService.findMany('api::event.event', {
      ...ctx.query,
    });

    return this.transformResponse(entities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    try {
      strapi.log.info('Finding one with query:', JSON.stringify({
        where: { uuid: id },
        ...ctx.query,
      }));

      const entity = await strapi.db.query('api::event.event').findOne({
        where: { uuid: id },
        ...ctx.query,
      });

      if (!entity) {
        return ctx.notFound('Event not found');
      }

      return this.transformResponse(entity);
    } catch (error) {
      strapi.log.error('Error fetching entity: ', error);
      return ctx.internalServerError("Internal server error");
    }
  },

  async search (ctx) {
    const { query } = ctx.request.query;

    if (!query) {
      return ctx.badRequest('Search query is required');
    }

    try {
      strapi.log.info('Searching events with query:', query);

      const entities = await strapi.entityService.findMany('api::event.event', {
        filters: {
          $or: [
            {name: {$containsi: query}},
            {description: { $containsi: query }}
          ]
        },
        ...ctx.query,
      });
      strapi.log.info(`Found ${entities.length} events`);

      const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
      return this.transformResponse(sanitizedEntities);
    } catch (error) {
      strapi.log.error('Error searching events:', error);
      return ctx.internalServerError("Internal server error");
    }
  },

  async update(ctx){
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Event uuid is required');
    }

    try {
      const data = ctx.request.body.data || {};

      console.log('Event update data: ', data);

      // fetch existing event
      const existingEvent = await strapi.db.query('api::event.event').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingEvent) {
        return ctx.notFound(`Event with uuid ${id} is not found`);
      }

      console.log(`existing event: ${existingEvent}`);

      const updateData = {
        name: data.name,
        description: data.description,
        event_link: data.event_link,
        start_date: data.start_date,
        end_date: data.end_date
      }

      if ('image_cover' in data) {
        if (existingEvent.image_cover) {
          try {
            await strapi.plugins.upload.services.upload.remove({
              id: existingEvent.image_cover.id
            });
          } catch (error) {
            console.log('error removing image event: ', error);
          }
        }

        updateData.image_cover = data.image_cover || null;
      }

      console.log('update data: ', updateData);

      const response = await strapi.db.query('api::event.event').update({
        where: { uuid: id },
        data: updateData
      })

      console.log('response', response);

      return this.transformResponse(response);
    } catch (error) {
      console.error('Update error: ', error);
      return ctx.badRequest('Error updating event', { error: error.message });
    }
  },

  async delete(ctx) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('Event uuid is requeired');
    }

    try {
      const existingEvent = await strapi.db.query('api::event.event').findOne({
        where: { uuid: id },
        ...ctx.query
      });

      if (!existingEvent) {
        return ctx.notFound(`Event with uuid ${id} is not found`);
      }

      console.log(existingEvent);

      if (existingEvent) {
        try {
          await strapi.plugins.upload.services.upload.remove({ id: existingEvent.image_cover.id });
        } catch (error) {
          console.log('error removing image event', error);
        }
      }

      const response = await strapi.db.query('api::event.event').delete({
        where: { uuid: id },
      });

      return this.transformResponse(response);
    } catch (error) {
      console.error('Delete Error', error);
      return ctx.badRequest('Error deleting event', { error: error.message });
    }
  }
}));
