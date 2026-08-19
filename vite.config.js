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
        // 알림 API(/notifications)는 다른 API들과 달리 /api 프리픽스가 없어서 별도로 등록해야 함
        // — 안 그러면 Vite가 SPA 폴백으로 index.html을 돌려줘서 JSON 대신 HTML이 응답으로 옴.
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
        '/notifications': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
        // 서울 열린데이터광장 Open API(서울외국인포털 서울시소식) — 우리 백엔드와 무관한 외부 공공 API.
        // HTTP 평문 + CORS 미지원이라 로컬에서도 프록시가 필요함.
        '/seoul-api': {
          target: 'http://openapi.seoul.go.kr:8088',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/seoul-api/, ''),
        },
      },
    },
  }
})
