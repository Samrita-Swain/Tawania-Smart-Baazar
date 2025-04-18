import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Use port 5174 for consistency
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001', // Use 127.0.0.1 instead of localhost
        changeOrigin: true,
        secure: false,
        // Don't rewrite paths - keep the /api prefix
        rewrite: (path) => path, // Keep the path as is
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:');
            console.log('Error message:', err.message);
            console.log('Error code:', err.code);
            console.log('Error stack:', err.stack);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`Received ${proxyRes.statusCode} for ${req.method} ${req.url}`);
          });
        }
      }
    }
  },
  // Optimize build
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['tailwindcss']
        }
      }
    }
  }
})
