const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api', {
      target: process.env.PROXY || 'http://raspberrypi.local:9000',
      changeOrigin: true,
      secure: true,
    })
  );
};
