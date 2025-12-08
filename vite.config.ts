import path from 'node:path'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), wasm(), topLevelAwait()],
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.trycloudflare.com']
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
