// 캘린더 일정 제목(GET /api/calendar/events)은 백엔드가 한국어 평문으로만 내려줘서,
// 영어 모드에서도 홈 체크리스트/캘린더/일정 상세에 한국어가 그대로 노출되고 있었음.
// 백엔드가 다국어 제목을 주기 전까지 프론트에서 규칙 기반으로 영어 제목을 만들어 대체한다.
// (가이드 제목을 guideContent.js의 TITLES_EN으로 대체하는 것과 같은 방식.)
//
// 1) 백엔드가 조회 시점에 계산해서 내려주는 가상 일정(eventId -1/-2)은 i18n 키로 바로 대체.
// 2) 그 외에는 RULES를 순서대로 적용해 정규식으로 매칭 — TOPIK 회차처럼 숫자가 들어가는 제목도
//    캡처해서 그대로 살린다.
// 3) 어느 규칙에도 안 걸리면 GLOSSARY로 단어 단위 치환을 시도하고, 그러고도 한글이 남으면
//    (= 안전하게 번역하지 못한 제목) 원문을 그대로 반환한다. 반쯤 번역된 문장을 보여주지 않기 위함.

const HANGUL = /[가-힣]/

// [정규식, 영어 템플릿($1, $2 = 캡처 그룹)]
const RULES = [
  [/^제?\s*(\d+)\s*회\s*TOPIK\s*(?:정기\s*)?접수\s*기간$/i, 'TOPIK #$1 application period'],
  [/^제?\s*(\d+)\s*회\s*TOPIK\s*(?:정기\s*)?시험(?:일)?$/i, 'TOPIK #$1 exam day'],
  [/^제?\s*(\d+)\s*회\s*TOPIK\s*성적\s*발표(?:일)?$/i, 'TOPIK #$1 results announcement'],
  [/^제?\s*(\d+)\s*회\s*TOPIK\s*(.*)$/i, 'TOPIK #$1 $2'],
  [/^TOPIK\s*접수\s*기간$/i, 'TOPIK application period'],
  [/^TOPIK\s*시험(?:일)?$/i, 'TOPIK exam day'],
  [/^TOPIK\s*성적\s*발표(?:일)?$/i, 'TOPIK results announcement'],
  [/^체류\s*기간\s*만료\s*D-?\s*(\d+)(?:\s*안내)?$/, 'Stay period expires in $1 days'],
  [/^체류\s*기간\s*만료(?:일)?$/, 'Stay period expiration'],
  [/^체류\s*기간\s*연장(?:\s*신청)?(?:\s*기간)?$/, 'Period of stay extension'],
  [/^외국인\s*등록(?:증)?\s*(?:신청|발급)(?:\s*기한|\s*기간)?$/, 'Alien registration'],
  [/^외국인\s*등록(?:증)?\s*(?:갱신|재발급)$/, 'Alien registration card renewal'],
  [/^시간제\s*취업\s*(?:허가|확인서)(?:\s*신청)?$/, 'Part-time work permit'],
  [/^건강\s*보험(?:료)?\s*(?:납부|가입)(?:\s*기한)?$/, 'National health insurance payment'],
  [/^수강\s*신청(?:\s*기간)?$/, 'Course registration period'],
  [/^등록금\s*납부(?:\s*기간|\s*기한)?$/, 'Tuition payment period'],
  [/^(\d{4})학년도\s*(\d)학기\s*(.*)$/, '$1 semester $2 $3'],
]

// RULES에 없는 제목을 마지막으로 시도해보는 단어 사전. 긴 표현부터 치환해야 부분 치환이 안 생김.
const GLOSSARY = [
  ['접수 기간', 'application period'],
  ['접수기간', 'application period'],
  ['신청 기간', 'application period'],
  ['신청기간', 'application period'],
  ['성적 발표', 'results announcement'],
  ['성적발표', 'results announcement'],
  ['체류기간', 'period of stay'],
  ['체류 기간', 'period of stay'],
  ['외국인등록', 'alien registration'],
  ['시간제취업', 'part-time work'],
  ['시간제 취업', 'part-time work'],
  ['건강보험', 'health insurance'],
  ['수강신청', 'course registration'],
  ['등록금', 'tuition'],
  ['시험일', 'exam day'],
  ['시험', 'exam'],
  ['만료', 'expiration'],
  ['연장', 'extension'],
  ['납부', 'payment'],
  ['발급', 'issuance'],
  ['갱신', 'renewal'],
  ['허가', 'permit'],
  ['안내', 'notice'],
  ['기한', 'deadline'],
  ['마감', 'deadline'],
]

function applyGlossary(title) {
  let result = title
  for (const [ko, en] of GLOSSARY) {
    result = result.split(ko).join(en)
  }
  return result
}

// 가상 일정(백엔드가 계산해서 내려주는 체류기간 만료 안내)은 eventId로 식별해 i18n 문구를 쓴다.
const VIRTUAL_EVENT_KEYS = {
  '-1': 'home.stayExpirationChecklistTitle',
  '-2': 'home.stayExpirationChecklistTitle',
}

export function translateEventTitle(title, { eventId, locale, t } = {}) {
  if (!title) return title
  if (locale === 'ko') return title

  if (t && VIRTUAL_EVENT_KEYS[String(eventId)]) {
    return t(VIRTUAL_EVENT_KEYS[String(eventId)])
  }

  if (!HANGUL.test(title)) return title

  const trimmed = title.trim()
  for (const [pattern, template] of RULES) {
    const match = trimmed.match(pattern)
    if (match) return trimmed.replace(pattern, template).replace(/\s+/g, ' ').trim()
  }

  const glossed = applyGlossary(trimmed).replace(/\s+/g, ' ').trim()
  return HANGUL.test(glossed) ? title : glossed
}
