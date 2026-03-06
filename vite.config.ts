import path from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'

import { dataComponent } from './.dev/plugins/vite-plugin-data-component'

export default defineConfig({
  plugins: [dataComponent(), tailwindcss(), reactRouter(), tsconfigPaths(), wasm(), topLevelAwait()],
  build: {
    cssCodeSplit: false // All CSS in one file - prevents FOUC on SPA navigation
  },
  ssr: {
    // Bundle i18n modules instead of externalizing — prevents dual-module issue
    // where I18nextProvider and useTranslation get different React contexts
    noExternal: ['i18next', 'react-i18next', 'i18next-http-backend']
  },
  server: {
    host: '0.0.0.0',
    port: 5190,
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.trycloudflare.com', 'neylin.io']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './app'),
      'graph-engine': path.resolve(__dirname, '../graph-engine/pkg/graph_engine.js')
    }
  },
  optimizeDeps: {
    exclude: ['graph-engine']
  }
})
