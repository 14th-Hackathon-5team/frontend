import api from './axios'

// 유학생 관련 맞춤 뉴스 조회 — GET /api/news. 백엔드가 AI 서버(네이버 뉴스 검색 + 요약)를 대신 호출해서
// 결과를 돌려줌. 뉴스가 없으면 200과 빈 배열, AI 서버 통신 실패 시 503(NEWS_SERVICE_UNAVAILABLE).
export function getNews() {
  return api.get('/api/news')
}
