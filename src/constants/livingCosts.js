// 생활비 시뮬레이터 기준값.
// 각 금액은 2026년 8월 기준 공개 통계·시세 자료를 근거로 정했고, 출처를 항목마다 주석으로 남겨둔다.
// 기본값은 '수도권(metro)' 기준이며, AREA_MULTIPLIER로 서울/지방 금액을 환산한다.

export const MINIMUM_WAGE = 10320 // 2026년 최저임금 시급
export const WEEKS_PER_MONTH = 4.345 // 365일 ÷ 7일 ÷ 12개월
export const HEALTH_INSURANCE = 79320 // 유학생 건강보험료 (전원 동일)

// 지역별 물가 계수 (주거·식비에 적용)
// 근거: 서울 대학가 원룸 평균 월세 62.5만원(한국경제, 2026.08) vs 지방 대학가 40만원대.
export const AREA_MULTIPLIER = {
  seoul: 1.15,
  metro: 1,
  region: 0.8,
}

// 주거 형태별 입력 항목.
// group: 'monthly' | 'oneTime', refundable: 월 비용에서 제외(퇴거 시 환급), flat: 지역 계수 미적용
export const HOUSING_FIELDS = {
  // 자취(원룸) — 서울 대학가 평균 월세 62.5만원 기준을 수도권으로 환산한 값(한국경제, 2026.08).
  oneroom: [
    { key: 'rent', group: 'monthly', default: 545000 },
    { key: 'maintenance', group: 'monthly', default: 70000 }, // 원룸 관리비 5~10만원대
    { key: 'electricity', group: 'monthly', default: 25000 }, // 1인가구 월평균 전기요금 2.3~2.9만원
    { key: 'gas', group: 'monthly', default: 25000 }, // 도시가스 연평균(겨울 편차 큼)
    { key: 'water', group: 'monthly', default: 10000 }, // 1인가구 수도요금 약 1만원
    { key: 'appliances', group: 'oneTime', default: 400000, flat: true }, // 냉장고·세탁기·전자레인지 등 소형/중고 기준
    { key: 'furniture', group: 'oneTime', default: 350000, flat: true }, // 침대·책상·의자 기준
    // 중개보수: 보증금 1,000만 + 월세 62.5만 → 환산가액 7,250만원, 요율 0.4%(한도 30만원)
    { key: 'brokerFee', group: 'oneTime', default: 290000, flat: true },
    // 보증금: 원룸 월세 통계의 표준 환산 기준인 1,000만원
    { key: 'deposit', group: 'oneTime', default: 10000000, flat: true, refundable: true },
  ],
  // 기숙사 — 국립대 2인실 학기 55~86만원(월 14~21만), 서울 사립대 월 30~45만원의 중간값.
  dorm: [
    { key: 'monthlyFee', group: 'monthly', default: 305000 },
    { key: 'etc', group: 'monthly', default: 0 },
  ],
  // 고시원 — 서울 주요 대학가 평균 39~49만원(고방, 2026.03) 기준.
  goshiwon: [
    { key: 'monthlyFee', group: 'monthly', default: 365000 },
    { key: 'etc', group: 'monthly', default: 0 },
  ],
  // 하숙 — 서울 대학가 2식 포함 60~70만원(2026.03 보도) 기준.
  hasuk: [
    { key: 'monthlyFee', group: 'monthly', default: 565000 },
    { key: 'etc', group: 'monthly', default: 0 },
  ],
}

// 공과금으로 따로 묶어서 보여줄 항목
export const UTILITY_KEYS = ['electricity', 'gas', 'water', 'maintenance']

// 식비 — 서울 1인가구 월 식비 50만원(배달·외식 포함 시 70만원, 데일리팝 2026) 기준을 수도권으로 환산.
// 학식은 한 끼 5,000~6,000원 × 하루 2끼 기준.
export const MEAL_COST = {
  cafeteria: 300000,
  cook: 350000,
  mixed: 450000,
  eatout: 620000,
}

// 교통 — 수도권 지하철 기본요금 1,550원(2025.06 인상) × 왕복 × 22일 ≈ 68,000원.
// K-패스는 월 15회 이상 이용 시 청년(19~34세) 30% 환급 → 약 47,600원.
export const TRANSPORT_COST = {
  walk: 0,
  kpass: 47600,
  card: 68000,
}

// 통신비 — 알뜰폰은 20~30GB 요금제 2~3만원대, 통신 3사는 5~7만원대.
// 외국인 등록증 발급 전에는 선불 요금제만 가입 가능.
export const TELECOM_COST = {
  mvno: 25000,
  major: 55000,
  prepaid: 40000,
}

// 연 단위 수수료 (비자 연장 + 외국인 등록증)
export const VISA_FEE_YEARLY = {
  first: 35000,
  next: 95000,
}

// 아르바이트 — 시간·시급을 직접 입력받는다. D-2 비자는 주 28시간까지만 허용.
export const PART_TIME_LIMIT_HOURS = 28

export const PART_TIME_FIELDS = [
  { key: 'weeklyHours', group: 'monthly', default: 0, flat: true, unit: 'hour' },
  { key: 'hourlyWage', group: 'monthly', default: MINIMUM_WAGE, flat: true },
]

// 매달 들어오는 고정 수입 (아르바이트 외). 사람마다 편차가 커서 기본값은 0.
export const INCOME_FIELDS = [
  { key: 'allowance', group: 'monthly', default: 0, flat: true },
  { key: 'scholarship', group: 'monthly', default: 0, flat: true },
  { key: 'otherIncome', group: 'monthly', default: 0, flat: true },
]
