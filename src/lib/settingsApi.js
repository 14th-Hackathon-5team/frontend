import api from './axios'

// 설정 정보 조회 (앱 표시 언어, 알림 수신 설정, 계정 상태) — GET /api/settings/me
export function getSettings() {
  return api.get('/api/settings/me')
}

// 앱 표시 언어 변경 — PATCH /api/settings/me/language
// 주의: 요청 필드명은 language가 아니라 preferredLanguage.
export function updateLanguageSetting(preferredLanguage) {
  return api.patch('/api/settings/me/language', { preferredLanguage })
}

// 푸시 알림 수신 설정 변경 — PATCH /api/settings/me/alarm
export function updateAlarmSetting(alarmSetting) {
  return api.patch('/api/settings/me/alarm', { alarmSetting })
}
