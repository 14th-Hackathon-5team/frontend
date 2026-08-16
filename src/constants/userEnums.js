// 백엔드 공식 스펙 기준 (2026-08-13, 고재민 공유) — 회원가입 API가 요구하는 실제 Enum 값.
// 디자인 프로토타입(tqwhyl.readdy.co)의 간소화된 옵션 대신 이 값을 사용해야 API가 성공함.
// 라벨은 하드코딩하지 않고 src/locales/{ko,en}.json의 enums.* 아래에서 번역해 옴 (translateOptions 참고).
// 참고: docs/backend-signup-fieldset-diff.md, docs/backend-notes-2026-08-13.md

export const USER_STATUS_VALUES = [
  'BEFORE_ENTRY',
  'HIGH_SCHOOL',
  'LANGUAGE_STUDENT',
  'UNDERGRADUATE',
  'GRADUATE',
  'EXCHANGE_STUDENT',
  'OTHER',
]

export const VISA_TYPE_VALUES = ['D2', 'D4', 'H1', 'F2', 'F5', 'F6', 'OTHER']

export const HOUSING_TYPE_VALUES = ['DORMITORY', 'RENT', 'HOMESTAY', 'GOSIWON', 'SHARE_HOUSE', 'OTHER']

// 배포된 서버 스웨거(2026-08-14) 기준 enum이 NOT_PLANNED로 확인됨 — 고재민 공유 예시의 NOT_WORKING은 오타였음.
export const PART_TIME_STATUS_VALUES = ['WORKING', 'SEARCHING', 'NOT_PLANNED']

export const TOPIK_LEVEL_VALUES = ['NONE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6']

export const LANGUAGE_VALUES = ['KOREAN', 'ENGLISH']

export const NATIONALITY_VALUES = [
  'NG', 'ZA', 'NL', 'NP', 'NZ', 'TW', 'KR', 'DE', 'LA', 'RU',
  'MY', 'MX', 'MN', 'US', 'MM', 'BD', 'VN', 'BR', 'SA', 'LK',
  'ES', 'SG', 'GB', 'UZ', 'UA', 'IR', 'EG', 'IT', 'IN', 'ID',
  'JP', 'CN', 'KZ', 'KH', 'CA', 'KG', 'TH', 'TR', 'PK', 'PL',
  'FR', 'PH', 'AU', 'HK',
]

// t()와 enums.* 아래 그룹 이름(예: 'userStatus'), value 배열을 받아 {value, label} 목록으로 변환.
export function translateOptions(t, group, values) {
  return values.map((value) => ({ value, label: t(`enums.${group}.${value}`) }))
}
