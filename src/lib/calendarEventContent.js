// 캘린더 일정 상세(GET /api/calendar/events/{eventId})도 가이드처럼 description이 1문장짜리 평문이라
// (2026-08-20 확인), 카테고리별로 프론트에서 상세 콘텐츠를 채운다.
// TOPIK_APPLICATION/TOPIK_EXAM은 guideContent.js의 TOPIK 가이드(3: 접수 방법, 4: 시험 당일 안내)와
// 다루는 내용이 사실상 같아서 새로 쓰지 않고 그대로 재사용 — 가이드 화면과 캘린더 화면에서 같은 주제에
// 대해 다른 설명이 나오는 걸 방지한다.
// VISA는 체류기간 만료 D-30 안내(eventId=-1)/만료 당일(eventId=-2) 가상 일정 전용 — 이 두 일정은
// 실제 저장된 일정이 아니라 백엔드가 조회 시점에 계산해서 내려주지만(2026-08-20 재확인: 상세 조회
// GET /api/calendar/events/-1, -2 모두 200 정상 응답 — Home.jsx/Calendar.jsx에 남아있던 "404라서
// 이동 안 시킴"이라는 코멘트는 더 이상 사실이 아님), 내용 자체는 여전히 1문장짜리 평문이라 여기서
// 상세 콘텐츠를 채운다. 대상/상황/조치/기한/위반시/출처는 디테일 탭의 "체류기간 만료/연장" 알림
// (실제 국가법령정보센터 출처, notificationId 16 등에서 2026-08-20 확인)과 동일한 사실을 재사용한다.
import { GUIDE_CONTENT_OVERRIDES } from './guideContent'

const CATEGORY_TO_GUIDE_ID = {
  TOPIK_APPLICATION: 3,
  TOPIK_EXAM: 4,
}

const VISA_CONTENT = `[SUMMARY]
D-2·D-4 등 학업 목적 체류자격은 정해진 체류기간이 있어요. 계속 한국에 머무를 계획이라면 만료일 전에 체류기간 연장허가를 받아야 해요.

[IMPORTANT]
연장허가를 받지 않고 체류기간을 넘기면 불법체류 상태가 될 수 있어요. 만료일이 다가오면 미리 서류를 준비해서 신청하세요.

[STEP 1]
대상 확인하기
허가받은 체류기간을 초과하여 대한민국에 계속 체류하려는 외국인이 대상이에요.

[STEP 2]
신청 시기 확인하기
현재 허가된 체류기간이 끝나기 전에 연장을 신청해야 해요.

[STEP 3]
관할 출입국·외국인청에 연장허가 신청하기
법무부장관(관할 출입국·외국인청)의 체류기간 연장허가를 받아야 해요. 정확한 제출서류는 하이코리아(HiKorea)에서 확인하세요.

[CAUTION]
위반 시: 체류기간 연장허가를 받지 않고 체류기간을 초과하여 계속 체류하면 3년 이하의 징역 또는 3천만원 이하의 벌금에 처할 수 있다.

출처: 국가법령정보센터 · 출입국관리법 제25조, 제94조제17호`

const CATEGORY_CONTENT = {
  VISA: VISA_CONTENT,
}

export function getCalendarEventContentOverride(category) {
  const guideId = CATEGORY_TO_GUIDE_ID[category]
  return CATEGORY_CONTENT[category] ?? (guideId ? GUIDE_CONTENT_OVERRIDES[guideId] : undefined)
}
