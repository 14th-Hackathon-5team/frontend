import api from './axios'

// 외국인 유학생 관련 뉴스를 백엔드가 AI 서버 대신 호출해서 내려주는 프록시 — GET /api/news.
// 로그인 토큰이 실린 api 인스턴스를 그대로 씀(seoulJobsApi.js와 동일 패턴).
export function getNews() {
  return api.get('/api/news')
}
