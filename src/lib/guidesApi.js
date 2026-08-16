import api from './axios'

// 카테고리별 가이드 목록 조회 — GET /api/guides?category=
// category: VISA | TOPIK_APPLICATION | TOPIK_EXAM | LEGAL | ACADEMIC
export function getGuidesByCategory(category) {
  return api.get('/api/guides', { params: { category } })
}

// 가이드 상세 조회 — GET /api/guides/{guideId}
export function getGuideDetail(guideId) {
  return api.get(`/api/guides/${guideId}`)
}
