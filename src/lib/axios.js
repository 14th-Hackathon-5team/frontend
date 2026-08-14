import axios from 'axios'

// 로컬 개발(vite dev)에서는 vite.config.js의 /api 프록시를 거쳐 같은 origin으로 요청 —
// 백엔드(EC2)에 CORS 설정이 없어 직접 호출 시 브라우저가 응답을 막기 때문(docs/backend-notes 참고).
// 프로덕션 빌드에서는 프록시가 없으므로 VITE_API_BASE_URL로 직접 호출.
const api = axios.create({
  baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: 401 처리 (예: accessToken 재발급, 로그아웃 처리, 로그인 페이지로 리다이렉트 등)
    }
    return Promise.reject(error)
  },
)

export default api
