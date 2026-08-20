// 백엔드 AI가 아직 감지하지 않는 두 가지 맞춤 추천(외국인등록 미등록, 시간제취업 허가 필요)을
// 이미 갖고 있는 프로필 데이터(GET /api/users/me)만으로 프론트에서 직접 계산해 채운다.
// 대학 입학 추천처럼 실제 기관(대학명·전형일정)의 사실 정보가 필요한 항목은 프론트에서 지어낼 수 없어
// 포함하지 않는다 — 이 두 항목은 법(출입국관리법)에 근거한 일반 절차라 안전하게 계산 가능.
// notificationId는 실제 서버 알림(정수)과 겹치지 않도록 문자열 id를 쓰고, isRead:true로 두어
// NotificationDetail.jsx가 PATCH /notifications/{id}/read를 호출하지 않도록 한다(실제 알림이 아님).
import { daysUntil } from './notificationHelpers'
import i18n from '../i18n'

const PART_TIME_PERMIT_VISA_TYPES = ['D2', 'D4']
const ACTIVE_PART_TIME_STATUSES = ['WORKING', 'SEARCHING']

export function getClientRecommendations(profile, translate) {
  if (!profile) return []
  const t = translate ?? i18n.t.bind(i18n)
  const items = []

    const daysSinceEntry = profile.entryDate ? -daysUntil(profile.entryDate) : null
  const hasValidEntryDate = Number.isFinite(daysSinceEntry) && daysSinceEntry >= 0 && daysSinceEntry <= 3650

  if (profile.hasAlienRegistration === false && hasValidEntryDate) {
    const daysLeft = 90 - daysSinceEntry
    items.push({
      notificationId: 'client-alien-registration',
      title: t('clientRecommendations.alienRegistration.title'),
      reason:
        daysLeft >= 0
          ? t('clientRecommendations.alienRegistration.reasonRemaining', { days: daysLeft })
          : t('clientRecommendations.alienRegistration.reasonOverdue'),
      priority: daysLeft <= 30 ? 5 : daysLeft <= 60 ? 3 : 2,
      isRead: true,
      createdAt: new Date().toISOString(),
      details: {
        title: t('clientRecommendations.alienRegistration.title'),
        lawName: t('clientRecommendations.alienRegistration.lawName'),
        target: t('clientRecommendations.alienRegistration.target'),
        situation: t('clientRecommendations.alienRegistration.situation'),
        action: t('clientRecommendations.alienRegistration.action'),
        details: t('clientRecommendations.alienRegistration.details'),
        deadline: t('clientRecommendations.alienRegistration.deadline'),
        sourceName: t('clientRecommendations.alienRegistration.sourceName'),
      },
    })
  }

  if (PART_TIME_PERMIT_VISA_TYPES.includes(profile.visaType) && ACTIVE_PART_TIME_STATUSES.includes(profile.partTimeStatus)) {
    items.push({
      notificationId: 'client-part-time-permit',
      title: t('clientRecommendations.partTimePermit.title'),
      reason:
        profile.partTimeStatus === 'WORKING'
          ? t('clientRecommendations.partTimePermit.reasonWorking')
          : t('clientRecommendations.partTimePermit.reasonSearching'),
      priority: 3,
      isRead: true,
      createdAt: new Date().toISOString(),
      details: {
        title: t('clientRecommendations.partTimePermit.title'),
        lawName: t('clientRecommendations.partTimePermit.lawName'),
        target: t('clientRecommendations.partTimePermit.target', { visaType: profile.visaType }),
        situation: t('clientRecommendations.partTimePermit.situation'),
        action: t('clientRecommendations.partTimePermit.action'),
        details: t('clientRecommendations.partTimePermit.details'),
        sourceName: t('clientRecommendations.partTimePermit.sourceName'),
      },
    })
  }

  return items
}