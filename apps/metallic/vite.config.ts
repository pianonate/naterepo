/// <reference types='vitest' />
import { defineConfig } from 'vite'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/metallic',
  base: '/metallic/',

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Specify that Vite can serve files from the entire project directory
      // hop up 2 paths or this will fail
      allow: ['../../'],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  // apparently this provides access to TypeScript paths for vite within nx so when you compile your lib
  // it can find it via your import references
  plugins: [nxViteTsPaths()],

 // Uncomment this if you are using workers.
 //  worker: {
 //   plugins: [ nxViteTsPaths() ],
 //  },
})
