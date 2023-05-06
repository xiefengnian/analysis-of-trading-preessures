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
});
