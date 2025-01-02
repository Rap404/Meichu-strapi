module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products/search',
      handler: 'product.search',
      config: {
        auth: false,
        middlewares: ['api::product.products-populate']
      }
    }
  ]
}
