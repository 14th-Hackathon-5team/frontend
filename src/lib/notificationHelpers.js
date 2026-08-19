// GET /notifications의 details는 카테고리별로 모양이 다른 가변 JSON이라(스웨거 설명: "상세 정보(가변 JSON)"),
// 명시적 type 필드 없이 필드 존재 여부로 LAW/UNIVERSITY를 구분한다.
export function detectNotificationType(details) {
  if (!details) return 'GENERAL'
  if (details.lawName || details.article) return 'LAW'
  if (details.schoolName || details.application_schedule) return 'UNIVERSITY'
  return 'GENERAL'
}

// 실제 API는 priority가 1~5 정수(스웨거: "높을수록 중요"). 문자열(HIGH/MEDIUM/LOW)이 오는 경우도 방어적으로 처리.
export function getPriorityTier(priority) {
  if (typeof priority === 'number') {
    if (priority >= 4) return 'HIGH'
    if (priority === 3) return 'MEDIUM'
    return 'LOW'
  }
  const upper = String(priority ?? '').toUpperCase()
  return ['HIGH', 'MEDIUM', 'LOW'].includes(upper) ? upper : 'LOW'
}

const PRIORITY_ORDER = { HIGH: 1, MEDIUM: 2, LOW: 3 }

export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => PRIORITY_ORDER[getPriorityTier(a.priority)] - PRIORITY_ORDER[getPriorityTier(b.priority)])
}

// 상단 카드뉴스용 피드 — priority 순으로 정렬하고, 제목이 완전히 같은 항목(예: 같은 "체류기간 만료/연장"이
// 서로 다른 날짜에 두 번 생성된 경우)은 우선순위가 더 높은 것 하나만 남겨 중복을 없앤다.
export function buildFeed(notifications, maxItems = 5) {
  const seenTitles = new Set()
  const feed = []
  for (const notification of sortByPriority(notifications)) {
    if (seenTitles.has(notification.title)) continue
    seenTitles.add(notification.title)
    feed.push(notification)
    if (feed.length >= maxItems) break
  }
  return feed
}

export function daysUntil(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export function formatRange(range) {
  if (!range) return null
  return `${range.start} ~ ${range.end}`
}
