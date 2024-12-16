'use strict';

/**
 * category router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::category.category', {
  config: {
    find: {
      middlewares: ['api::category.categories-populate'],
    },
    findOne: {
      middlewares: ['api::category.categories-populate'],
    },
    search: {
      middlewares: ['api::category.categories-populate'],
    }
  }
});

// {
//   routes: [
//     {
//       method: 'GET',
//       path: '/categories/search',
//       handler: 'category.search',
//       config: {
//         auth: false,
//         middlewares: ['api::category.categories-populate'],
//       },
//     },
//     {
//       method: 'GET',
//       path: '/categories',
//       handler: 'category.find',
//       config: {
//         auth: false,
//         middlewares: ['api::category.categories-populate']
//       },
//     },
//     {
//       method: 'GET',
//       path: '/categories/:id',
//       handler: 'category.findOne',
//       config: {
//         auth: false,
//         middlewares: ['api::category.categories-populate']
//       }
//     }
//   ]
// }


