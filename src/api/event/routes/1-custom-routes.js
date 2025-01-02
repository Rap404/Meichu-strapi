module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/search',
      handler: 'event.search',
      config: {
        auth: false,
        middlewares: ['api::event.events-populate']
      }
    }
  ]
}
