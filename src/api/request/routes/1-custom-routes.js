module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/requests/search',
      handler: 'request.search',
      config: {
        auth: false,
        middlewares: ['api::request.requests-populate']
      }
    }
  ]
}
