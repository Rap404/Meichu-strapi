module.exports = {
  routes: [
    {
    method: 'GET',
    path: '/ambassadors/search',
    handler: 'ambassador.search',
    config: {
      auth: false,
      middlewares: ['api::ambassador.ambassador-populate']
      }
    }
  ]
}
