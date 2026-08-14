import api from './axios'

// 월별 일정 조회 (공통 일정 + 내 개인 일정) — GET /api/calendar/events?year=&month=
export function getMonthlyEvents(year, month) {
  return api.get('/api/calendar/events', { params: { year, month } })
}

// 일정 상세 조회 — GET /api/calendar/events/{eventId}
export function getEventDetail(eventId) {
  return api.get(`/api/calendar/events/${eventId}`)
}
