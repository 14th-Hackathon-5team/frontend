import api from './axios'

// 내 알림 목록 조회 (최신순) — GET /notifications
export function getNotifications() {
  return api.get('/notifications')
}

// 알림 읽음 처리 — PATCH /notifications/{notificationId}/read
export function markNotificationRead(notificationId) {
  return api.patch(`/notifications/${notificationId}/read`)
}
