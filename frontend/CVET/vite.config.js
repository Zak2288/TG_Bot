import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    port: 8080,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'vuex'],
          'charts': ['chart.js', 'vue-chartjs'],
          'calendar': ['@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/vue3']
        }
      }
    }
  }
})
