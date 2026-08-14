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
