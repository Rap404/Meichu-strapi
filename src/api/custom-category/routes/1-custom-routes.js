module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/custom-categories/search',
      handler: 'custom-category.search',
      config: {
        auth: false,
        middlewares: ['api::custom-category.custom-category-populate']
      }
    }
  ]
}
