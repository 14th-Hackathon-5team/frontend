import api from './axios'

// 설정 정보 조회 (앱 표시 언어, 알림 수신 설정, 계정 상태) — GET /api/settings/me
export function getSettings() {
  return api.get('/api/settings/me')
}

// 앱 표시 언어 변경 — PATCH /api/settings/me/language
// 요청/응답 필드명 모두 language (스웨거 2026-08-16 재확인 — 예전 주석의 preferredLanguage는 오기였음).
export function updateLanguageSetting(language) {
  return api.patch('/api/settings/me/language', { language })
}

// 푸시 알림 수신 설정 변경 — PATCH /api/settings/me/alarm
export function updateAlarmSetting(alarmSetting) {
  return api.patch('/api/settings/me/alarm', { alarmSetting })
}
