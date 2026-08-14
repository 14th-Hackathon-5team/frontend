import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        // 백엔드(EC2)에 CORS 설정이 없어 로컬 개발 중에는 프록시로 우회.
        // 실제 CORS 설정이 추가되면 이 프록시와 axios.js의 DEV 분기는 제거 가능.
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
