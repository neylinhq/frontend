import path from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    wasm(),
    topLevelAwait(),
  ],
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
