

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/categories/search',
      handler: 'category.search',
      config: {
        auth: false,
        middlewares: ['api::category.categories-populate']
      }
    }
  ]
}
