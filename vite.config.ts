import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
        '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react') || id.includes('/node_modules/react-dom') || id.includes('/node_modules/react-router')) return 'vendor-react';
          if (id.includes('/node_modules/antd/') || id.includes('/node_modules/@ant-design/')) return 'vendor-antd';
          if (id.includes('/node_modules/@tiptap/') || id.includes('/node_modules/tiptap-markdown') || id.includes('/node_modules/prosemirror')) return 'vendor-editor';
          if (id.includes('/node_modules/react-markdown/') || id.includes('/node_modules/rehype') || id.includes('/node_modules/remark') || id.includes('/node_modules/lowlight/') || id.includes('/node_modules/highlight.js/')) return 'vendor-markdown';
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
