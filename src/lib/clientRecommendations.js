// 백엔드 AI가 아직 감지하지 않는 두 가지 맞춤 추천(외국인등록 미등록, 시간제취업 허가 필요)을
// 이미 갖고 있는 프로필 데이터(GET /api/users/me)만으로 프론트에서 직접 계산해 채운다.
// 대학 입학 추천처럼 실제 기관(대학명·전형일정)의 사실 정보가 필요한 항목은 프론트에서 지어낼 수 없어
// 포함하지 않는다 — 이 두 항목은 법(출입국관리법)에 근거한 일반 절차라 안전하게 계산 가능.
// notificationId는 실제 서버 알림(정수)과 겹치지 않도록 문자열 id를 쓰고, isRead:true로 두어
// NotificationDetail.jsx가 PATCH /notifications/{id}/read를 호출하지 않도록 한다(실제 알림이 아님).
import { daysUntil } from './notificationHelpers'

const PART_TIME_PERMIT_VISA_TYPES = ['D2', 'D4']
const ACTIVE_PART_TIME_STATUSES = ['WORKING', 'SEARCHING']

export function getClientRecommendations(profile) {
  if (!profile) return []
  const items = []

  if (profile.hasAlienRegistration === false && profile.entryDate) {
    const daysSinceEntry = -daysUntil(profile.entryDate)
    const daysLeft = 90 - daysSinceEntry
    items.push({
      notificationId: 'client-alien-registration',
      title: '외국인 등록',
      reason:
        daysLeft >= 0
          ? `입국일로부터 90일 이내에 외국인등록을 해야 해요. 앞으로 ${daysLeft}일 남았어요.`
          : '외국인등록 기한(입국일로부터 90일)이 이미 지났어요. 최대한 빨리 등록을 진행하세요.',
      priority: daysLeft <= 30 ? 5 : daysLeft <= 60 ? 3 : 2,
      isRead: true,
      createdAt: new Date().toISOString(),
      details: {
        title: '외국인 등록',
        lawName: '출입국관리법',
        target: '입국한 날부터 90일을 초과하여 대한민국에 체류하려는 외국인',
        situation: '대한민국에 입국하여 90일을 초과해 체류하려는 경우',
        action: '체류지를 관할하는 지방출입국·외국인관서의 장에게 외국인등록을 한다.',
        details: '준비 서류와 신청 절차, 관할 관서는 하이코리아(HiKorea)에서 확인할 수 있다.',
        deadline: '입국일로부터 90일 이내',
        sourceName: '하이코리아(HiKorea)',
      },
    })
  }

  if (PART_TIME_PERMIT_VISA_TYPES.includes(profile.visaType) && ACTIVE_PART_TIME_STATUSES.includes(profile.partTimeStatus)) {
    items.push({
      notificationId: 'client-part-time-permit',
      title: '시간제취업 허가',
      reason:
        profile.partTimeStatus === 'WORKING'
          ? '현재 아르바이트 중이신 것으로 등록돼 있어요. 시간제취업 허가를 받으셨는지 다시 확인해보세요.'
          : '아르바이트를 구하고 계신다면, 근무를 시작하기 전에 시간제취업 허가부터 받아야 해요.',
      priority: 3,
      isRead: true,
      createdAt: new Date().toISOString(),
      details: {
        title: '시간제취업 허가',
        lawName: '출입국관리법',
        target: `${profile.visaType} 체류자격으로 시간제취업을 하려는 유학생`,
        situation: '학업 목적 체류자격 소지자가 지정된 활동 외의 취업 활동을 하려는 경우',
        action: '관할 출입국·외국인청에 시간제취업 활동허가를 사전에 신청한다.',
        details: '학기 중·방학 중 허용 시간이 다르고 업종 제한이 있을 수 있다. 정확한 조건은 학교 국제처나 하이코리아에서 확인한다.',
        sourceName: '하이코리아(HiKorea)',
      },
    })
  }

  return items
}
