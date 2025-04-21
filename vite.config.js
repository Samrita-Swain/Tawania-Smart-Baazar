import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5174, // Use port 5174 for consistency
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:5002', // Use environment variable or default
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
  };
});
