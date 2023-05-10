import { defineConfig } from 'umi';

export default defineConfig({
  routes: [{ path: '/', component: 'index' }],
  npmClient: 'pnpm',
  proxy: {
    '/server': {
      target: 'http://localhost:8080',
      pathRewrite: { '^/server': '' },
    },
  },
  publicPath: '/web/',
  define: {
    apiBaseURL: process.env.NODE_ENV === 'development' ? '/server' : '/',
  },
  history: {
    type: 'hash',
  },
});
