import { defineConfig } from 'umi';

export default defineConfig({
  routes: [{ path: '/', component: 'index' }],
  npmClient: 'pnpm',
  proxy: {
    '/': {
      target: 'http://localhost:8080',
    },
  },
  publicPath: '/web/',
  history: {
    type: 'hash',
  },
});
