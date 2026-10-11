import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.VITE_SUPABASE_URL || ''

  return {
    plugins: [react()],
    server: {
      proxy: supabaseUrl
        ? {
            // Route all Supabase API calls through a local proxy
            // Bypasses supabase.co DNS block on Indian ISPs in dev mode
            '/api/supabase': {
              target: supabaseUrl,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
            },
          }
        : undefined,
    },
  }
})
