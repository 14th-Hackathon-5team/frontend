import api from './axios'

// 월별 일정 조회 (공통 일정 + 내 개인 일정) — GET /api/calendar/events?year=&month=
export function getMonthlyEvents(year, month) {
  return api.get('/api/calendar/events', { params: { year, month } })
}

// 임박 일정 조회 (오늘부터 7일 이내 공통 일정 + 내 개인 일정) — GET /api/calendar/events/upcoming
export function getUpcomingEvents() {
  return api.get('/api/calendar/events/upcoming')
}

// 일정 상세 조회 — GET /api/calendar/events/{eventId}
export function getEventDetail(eventId) {
  return api.get(`/api/calendar/events/${eventId}`)
}

// 일정 완료 체크 토글 — PATCH /api/calendar/events/{eventId}/complete
export function toggleEventCompleted(eventId) {
  return api.patch(`/api/calendar/events/${eventId}/complete`)
}
