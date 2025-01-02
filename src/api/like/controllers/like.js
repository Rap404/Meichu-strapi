'use strict';

/**
 * like controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::like.like', ({strapi}) => ({

  async create(ctx){
    try{
    const { user, product } = ctx.request.body.data;
    const uuid = uuidv4();

    if (!user || !product){
      return ctx.badRequest('Missing required fields');
    }

    const entry = await strapi.entityService.create('api::like.like', {
      data: {
        uuid,
        user,
        product,
        publishedAt: new Date()
      }, ...ctx.query
    });

    return this.transformResponse(entry);
  } catch (error) {
    return ctx.badRequest(error.message);
  }
  },

  async find(ctx){
    strapi.log.info('Finding with query: ', JSON.stringify(ctx.query))

    const entities = await strapi.entityService.findMany('api::like.like', {
      ...ctx.query,
    });

    return this.transformResponse(entities);
  },

  async findOne(ctx){
    const { id } = ctx.params;

    try {
      const entity = await strapi.db.query('api::like.like').findOne({
        where: { uuid: id },
        ...ctx.query,
      })

      if (!entity){
        return ctx.notFound('Entity not found')
      }

      return this.transformResponse(entity)
    } catch (error) {
      return ctx.badRequest(error.message)
    }
  },

  async delete(ctx){
    const { id } = ctx.params;

    try {
      const entity = await strapi.db.query('api::like.like').delete({
        where: { uuid: id },
        ...ctx.query,
      })

      if (!entity){
        return ctx.notFound('Entity not found')
      }

      return this.transformResponse(entity)
    } catch (error) {
      return ctx.badRequest(error.message)
  }
  }

}));
