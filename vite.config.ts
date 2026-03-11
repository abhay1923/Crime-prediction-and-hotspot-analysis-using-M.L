import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode so we can read them at config time
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // ---- Dev server ----
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL
            ? env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (p) => p, // keep /api prefix — nginx/backend expect it
        },
      },
    },

    // ---- Production build ----
    build: {
      outDir: 'dist',
      // Source maps expose your source to the browser in prod — disable
      sourcemap: isProd ? false : 'inline',
      // Raise the warning threshold (default 500kB is too tight for this app)
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Manual chunk splitting — keeps initial bundle small
          manualChunks: {
            // React core
            'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
            // Charting
            'vendor-charts': ['recharts'],
            // Maps
            'vendor-maps': ['leaflet', 'react-leaflet'],
            // UI component libraries
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-select',
              '@radix-ui/react-tooltip',
            ],
            // MUI (heavy — isolate it)
            'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            // Supabase
            'vendor-supabase': ['@supabase/supabase-js'],
            // Animation
            'vendor-motion': ['motion'],
          },
        },
      },
    },

    // ---- File types for raw import ----
    assetsInclude: ['**/*.svg', '**/*.csv'],

    // ---- Define global constants ----
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})
