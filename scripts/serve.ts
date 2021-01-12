import { createProxyMiddleware } from 'http-proxy-middleware';
import Bundler from 'parcel-bundler';
import express, { Express } from 'express';

const bundler = new Bundler('public/index.html', {
  cache: true,
});

// eslint-disable-next-line no-undef
const PROXY = process.env.PROXY || 'http://homebridge.local:9000';

const app: Express = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: PROXY,
    changeOrigin: true,
    secure: true,
  })
);

app.use(bundler.middleware());

// eslint-disable-next-line no-undef
app.listen(Number(process.env.PORT || 3000));
