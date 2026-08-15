// 백엔드 공식 스펙 기준 (2026-08-13, 고재민 공유) — 회원가입 API가 요구하는 실제 Enum 값.
// 디자인 프로토타입(tqwhyl.readdy.co)의 간소화된 옵션 대신 이 값을 사용해야 API가 성공함.
// 참고: docs/backend-signup-fieldset-diff.md, docs/backend-notes-2026-08-13.md

export const USER_STATUS_OPTIONS = [
  { value: 'BEFORE_ENTRY', label: 'Before Entry' },
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'LANGUAGE_STUDENT', label: 'Language Student' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'EXCHANGE_STUDENT', label: 'Exchange Student' },
  { value: 'OTHER', label: 'Other' },
]

export const VISA_TYPE_OPTIONS = [
  { value: 'D2', label: 'D-2' },
  { value: 'D4', label: 'D-4' },
  { value: 'H1', label: 'H-1' },
  { value: 'F2', label: 'F-2' },
  { value: 'F5', label: 'F-5' },
  { value: 'F6', label: 'F-6' },
  { value: 'OTHER', label: 'Other' },
]

export const HOUSING_TYPE_OPTIONS = [
  { value: 'DORMITORY', label: 'Dormitory' },
  { value: 'RENT', label: 'Rent' },
  { value: 'HOMESTAY', label: 'Homestay' },
  { value: 'GOSIWON', label: 'Goshiwon' },
  { value: 'SHARE_HOUSE', label: 'Share House' },
  { value: 'OTHER', label: 'Other' },
]

// 배포된 서버 스웨거(2026-08-14) 기준 enum이 NOT_PLANNED로 확인됨 — 고재민 공유 예시의 NOT_WORKING은 오타였음.
export const PART_TIME_STATUS_OPTIONS = [
  { value: 'WORKING', label: 'Working' },
  { value: 'SEARCHING', label: 'Searching' },
  { value: 'NOT_PLANNED', label: 'Not Planned' },
]

export const TOPIK_LEVEL_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'LEVEL_1', label: 'Level 1' },
  { value: 'LEVEL_2', label: 'Level 2' },
  { value: 'LEVEL_3', label: 'Level 3' },
  { value: 'LEVEL_4', label: 'Level 4' },
  { value: 'LEVEL_5', label: 'Level 5' },
  { value: 'LEVEL_6', label: 'Level 6' },
]

export const LANGUAGE_OPTIONS = [
  { value: 'KOREAN', label: '한국어' },
  { value: 'ENGLISH', label: 'English' },
]

export const NATIONALITY_OPTIONS = [
  { value: 'NG', label: '나이지리아' },
  { value: 'ZA', label: '남아프리카공화국' },
  { value: 'NL', label: '네덜란드' },
  { value: 'NP', label: '네팔' },
  { value: 'NZ', label: '뉴질랜드' },
  { value: 'TW', label: '대만' },
  { value: 'KR', label: '대한민국' },
  { value: 'DE', label: '독일' },
  { value: 'LA', label: '라오스' },
  { value: 'RU', label: '러시아' },
  { value: 'MY', label: '말레이시아' },
  { value: 'MX', label: '멕시코' },
  { value: 'MN', label: '몽골' },
  { value: 'US', label: '미국' },
  { value: 'MM', label: '미얀마' },
  { value: 'BD', label: '방글라데시' },
  { value: 'VN', label: '베트남' },
  { value: 'BR', label: '브라질' },
  { value: 'SA', label: '사우디아라비아' },
  { value: 'LK', label: '스리랑카' },
  { value: 'ES', label: '스페인' },
  { value: 'SG', label: '싱가포르' },
  { value: 'GB', label: '영국' },
  { value: 'UZ', label: '우즈베키스탄' },
  { value: 'UA', label: '우크라이나' },
  { value: 'IR', label: '이란' },
  { value: 'EG', label: '이집트' },
  { value: 'IT', label: '이탈리아' },
  { value: 'IN', label: '인도' },
  { value: 'ID', label: '인도네시아' },
  { value: 'JP', label: '일본' },
  { value: 'CN', label: '중국' },
  { value: 'KZ', label: '카자흐스탄' },
  { value: 'KH', label: '캄보디아' },
  { value: 'CA', label: '캐나다' },
  { value: 'KG', label: '키르기스스탄' },
  { value: 'TH', label: '태국' },
  { value: 'TR', label: '튀르키예' },
  { value: 'PK', label: '파키스탄' },
  { value: 'PL', label: '폴란드' },
  { value: 'FR', label: '프랑스' },
  { value: 'PH', label: '필리핀' },
  { value: 'AU', label: '호주' },
  { value: 'HK', label: '홍콩' },
]