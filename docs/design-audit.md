# K-Buddy 디자인 감사 (design-audit)

대상: https://tqwhyl.readdy.co (전체 13개 화면). 색상 값은 브라우저에서 `getComputedStyle` + 1×1 캔버스 픽셀 추출로 실측한 정확한 hex이며(추정치 아님), Tailwind 커스텀 팔레트(`background-*`, `foreground-*`, `primary-*`, `accent-*`)를 그대로 쓰고 있어 그 이름도 함께 기록함. 목록/URL은 [design-urls.md](./design-urls.md) 참고.

---

## 1. 디자인 토큰

### 색상

| 토큰 | 실측 값 | 용도 |
|---|---|---|
| `background-50` | `#fffbf4` | 전역 배경(크림) — 우리가 지금 쓰는 `#FDF8F0`과 근접하지만 다름 |
| `background-100`(추정) | `#fff7ea` | 인풋 필드 배경 |
| `foreground-950` | `#020c09` | 본문/제목 텍스트 (순검정이 아니라 아주 짙은 그린-블랙) |
| `foreground-800` | `#1e2c29` | 서브 헤딩 |
| `foreground-600` | `#52625e` | 보조 텍스트 |
| `foreground-500` | `#6e7e7b` | 캡션/placeholder |
| `foreground-400` | `#8c9d99` | 비활성 아이콘/텍스트 |
| `foreground-300` | `#aabcb8` | 보더, 매우 옅은 텍스트 |
| `primary-500` | `#f56100` | 메인 CTA(오렌지-레드), 체크박스, 활성 보더 |
| `primary-600` | `#d55200` | 버튼 hover/강조, 회원가입 Next 버튼 |
| `accent-500` | `#ed7e00` | 보조 강조(호박색), 아이콘 배경 |
| `accent-100` | `#ffd99b` | 뱃지 pill(D-3 등), 가이드 카드 아이콘 배경 |
| Kakao 옐로우 | `#fee500` | 카카오 로그인 버튼 (하드코딩 hex, 토큰 아님) |
| 에러 | `text-red-500` (Tailwind 기본) | Delete Account 등 |

→ **우리 구현(`brand`=#E8804A 단일톤)과 다르게, 실제 디자인은 `primary`(레드-오렌지)와 `accent`(호박색) 2톤 체계 + `foreground` 그레이-그린 8단계 스케일을 씀.**

### 타이포그래피
- 폰트: `"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif`
- 버튼 텍스트: `font-weight: 600`(semibold), 라벨: `500`
- 로고("K-Buddy")는 텍스트가 아니라 **이미지 에셋**(마스코트 캐릭터와 한 세트로 디자인된 워드마크 PNG/WebP)

### 형태
- 모든 인풋/버튼 border-radius: **12px**로 통일 (우리 `rounded-lg`=8px보다 큼)
- 카드/섹션 radius: 더 큼 (16~20px 급, 가이드 히어로 카드 등)
- 그림자: 거의 없음 — 플랫 + 보더 위주 디자인

---

## 2. 공통 컴포넌트 패턴

- **하단 탭 네비게이션**: 다크가 아니라 **크림/라이트 배경**. 아이콘 4개는 Home / Calendar / **Details**(나침반 아이콘) / Settings(사람 아이콘) — **"검색" 탭은 존재하지 않음**. 활성 탭은 `primary-500` 오렌지로 아이콘+라벨 동시 강조.
- **리스트 아이템**: 왼쪽 아이콘(outline) + 라벨 + (선택) 값 텍스트 + `›` 슈브론, 카드형 보더로 그룹핑, 섹션은 대문자 소제목(`ACCOUNT`, `SUPPORT` 등)으로 구분.
- **Pill 선택 버튼(2xN 그리드)**: 선택 시 `primary-500` 배경 + 흰 텍스트, 미선택은 `background-50` 배경 + 얇은 보더. 회원가입 "Status in Korea", 시뮬레이터 옵션 등에 반복 사용.
- **진행바(스텝 인디케이터)**: 얇은 바 N개, 완료/현재 단계까지 `primary` 채움, 나머지는 옅은 톤. 회원가입(3단계), 시뮬레이터(5단계) 둘 다 같은 패턴.
- **가이드 상세 카드**: 그라데이션 히어로 카드(아이콘+"Official Guide" 뱃지+예상 읽기 시간) → 노란/호박톤 "Important" 경고 박스 → 번호 원(`primary-500` 배경 흰 숫자) + 텍스트로 구성된 단계별 가이드. 5개 가이드 페이지 모두 동일 템플릿, 콘텐츠만 다름.
- **가이드/상세 드릴다운 화면은 하단 탭이 없음** (뒤로가기 화살표만). 반면 `/simulation`은 하단 탭이 유지됨 — 즉 "메인 탭 레이아웃 소속 여부"가 화면마다 다름.

---

## 3. 화면별 분석

### `/` — 언어선택
![language](./screenshots/00-language.jpg)
마스코트 캐릭터(모자 쓴 까치/까마귀) 단독 등장, "Choose your language" 타이틀, 좌우 화살표로 넘기는 캐러셀형 언어 선택기(현재 US/English 표시), 하단 오렌지 Continue 버튼. 로그인 이전 최초 진입 화면.

### `/login` — 로그인
![login](./screenshots/01-login.jpg)
K-Buddy 워드마크 이미지, 태그라인, 카카오(`#fee500` 배경, 검정 텍스트, 말풍선 아이콘) / 구글(흰 배경, 연한 보더, 실제 4색 G 로고) 버튼. **우리 현재 구현과 레이아웃·문구·색이 거의 동일** — 가장 잘 맞아떨어지는 화면.

### `/signup/profile` — 회원가입 (3단계)
![step1](./screenshots/13-signup-step1.jpg) ![step2](./screenshots/14-signup-step2.jpg) ![step3](./screenshots/15-signup-step3.jpg)

- **1단계 "Basic Info"**: Name, Date of Birth(전체 날짜, `연도-월-일` 플레이스홀더), Nationality(**고정 select**: US/China/Japan/Vietnam/Philippines/Indonesia/Thailand/Other), Status in Korea(**Student/Worker/Job Seeker/Other 4개 pill**)
- **2단계 "Visa & School"**: Visa Type(**자유 텍스트**), Visa Issue Date, Entry Date, School, Residence Type(**Dormitory/Self/Goshiwon 3개 pill**)
- **3단계 "Language & Goal"**: Language(English/한국어/中文/日本語/Tiếng Việt), TOPIK Goal(목표 레벨만, 1~6)

⚠️ **백엔드 스펙과 상당히 다름 — 아래 4절 참고.**

### `/home` — 홈
![home](./screenshots/02-home.jpg)
마스코트 아바타 + "MY ADMIN INFO" 카드(비자/외국인등록/다음마감일 요약), "Living Cost Simulator" 배너(→ `/simulation`), "COMMON CHECKLIST" / "MY CHECKLIST" 섹션(체크박스, 완료 시 취소선, D-day 뱃지). 와이어프레임 단계의 빈 다크 화면과 완전히 다른 최종 콘텐츠.

### `/calendar` — 캘린더
![calendar](./screenshots/03-calendar.jpg)
"2026 Calendar" 타이틀, 월/연도 드롭다운 셀렉터, 요일 그리드(일정 있는 날짜는 카테고리별 색상 원형 배지 — 법정/행정=진한 오렌지, 건강=호박색, 학사=브라운그레이), 하단에 해당 월 일정 리스트(색점+제목+날짜/기간).

### `/details` — 세부정보
![details](./screenshots/04-details.jpg)
상단 가로 스크롤 팁 카드(마스코트 일러스트 + 짧은 팁, "Alien Registration Guide" 등), 하단 세로 리스트 5개(Visa/Schedule/Admissions/Law & Regulations/TOPIK) — 각각 `/guide/:id`로 연결.

### `/guide/visa`, `/guide/schedule`, `/guide/admissions`, `/guide/law`, `/guide/topik`
![visa](./screenshots/05-guide-visa.jpg)
5개 모두 동일 템플릿(2절 참고). 콘텐츠는 실제 유학생 대상 가이드 문구가 채워져 있음(예: "D-2 visas have 8 sub-types...").

### `/settings` — 설정
![settings-top](./screenshots/10-settings-top.jpg) ![settings-scroll](./screenshots/11-settings-scroll.jpg)
프로필 헤더(오렌지 링 아바타 + 이름 + "학교 · 비자" 서브텍스트 + Edit Profile 버튼), 섹션 그룹: ACCOUNT(Language/Notifications/Edit Profile) → SUBSCRIPTION & BILLING → LEGAL INFORMATION → SUPPORT(+ 앱 버전 표시) → ACCOUNT MANAGEMENT(Log Out / **빨간색** Delete Account).

### `/simulation` — 생활비 시뮬레이터
![simulation](./screenshots/12-simulation.jpg)
**와이어프레임에 없던 화면.** "Budget Simulation" — 5단계 위저드(주거/식비 등 항목별), 상단에 실시간 "Est. monthly: 540K KRW" 합계, 카테고리 아이콘 카드, pill 선택지, "Confirm & next" + "Skip" 버튼.

---

## 4. 우리 구현/백엔드 스펙과의 차이 (중요)

> **업데이트(2026-08-13)**: 아래 4-1 내용을 근거로 백엔드에 필드 축소를 요청했으나(`docs/backend-signup-fieldset-diff.md`) 반려됨. 백엔드는 최초 14개 필드 스펙을 유지하고 `language`(`KOREAN`/`ENGLISH`) 필드만 추가함. 최종 반영 내용은 [backend-notes-2026-08-13.md](./backend-notes-2026-08-13.md) 참고. 아래 표는 "디자인 vs 최초 스펙" 비교 기록으로만 남겨둠.

### 4-1. 백엔드 회원가입 API 스펙과 디자인 폼이 맞지 않음

| 백엔드 필드 | 디자인 화면 상태 |
|---|---|
| `birthYear` (숫자) | 디자인은 **전체 생년월일**(Date of Birth) 입력 |
| `nationality` (자유 문자열, 백엔드 예시 `"KOREA"`) | 디자인은 **8개 고정 select**(미국/중국/일본/베트남/필리핀/인도네시아/태국/기타) — 한국이 옵션에 없음(내국인이 없는 서비스라 당연할 수 있으나 값 형식이 다름) |
| `userStatus` (7개: BEFORE_ENTRY~OTHER) | 디자인은 **Student/Worker/Job Seeker/Other 4개**뿐 |
| `visaType` (7개 고정 enum) | 디자인은 **자유 텍스트 입력** |
| `hasAlienRegistration` (boolean) | **디자인에 해당 입력 없음** |
| `stayExpirationDate` | **디자인에 해당 입력 없음** (대신 없던 "Visa Issue Date" 존재) |
| `housingType` (6개: DORMITORY/RENT/HOMESTAY/GOSIWON/SHARE_HOUSE/OTHER) | 디자인은 **Dormitory/Self/Goshiwon 3개**뿐 (HOMESTAY, SHARE_HOUSE, OTHER 없음, RENT는 "Self"로 추정) |
| `isParentSupported` | **디자인에 해당 입력 없음** |
| `partTimeStatus` | **디자인에 해당 입력 없음** |
| `currentTopikLevel` | **디자인에 해당 입력 없음** (목표 레벨만 있음) |
| `targetTopikLevel` (NONE, LEVEL_1~6) | 디자인엔 있지만 **NONE 옵션 없이 1~6만** |
| (백엔드에 없는 필드) | 디자인엔 **Language(선호 언어)**, **Visa Issue Date**가 새로 존재 |

→ 이 상태로 디자인을 그대로 구현하면 백엔드 필수 필드(`hasAlienRegistration`, `stayExpirationDate`, `isParentSupported`, `partTimeStatus`, `currentTopikLevel`) 값을 채울 UI가 없어 API 호출이 실패함. **백엔드 팀과 필드셋 재조율이 먼저 필요** — 이전 대화에서 확인한 "백엔드 API 확정 전 임의 구현 금지" 원칙과 같은 이유로, 이번에도 내가 임의로 필드를 추가/삭제해 맞추지 않았음.

### 4-2. 우리 현재 구현(3단계)과의 구조 차이
- 하단 네비: 우리는 **다크 배경 + 홈/캘린더/검색/설정**으로 구현했지만, 최종 디자인은 **라이트 배경 + 홈/캘린더/Details/설정** (검색 탭 자체가 없음, Details가 4번째 탭). `/search` 라우트는 최종 디자인에 존재하지 않음.
- 색상: 우리는 단일 `brand`(#E8804A) 오렌지를 썼지만 실제는 `primary`(#f56100)/`accent`(#ed7e00) 2톤 + 8단계 `foreground` 그레이-그린 스케일.
- 회원가입 진행바 UI 패턴(3단계, pill 그리드, 라운드 인풋)은 **우리가 이미 잘 맞춰 구현**해 둔 상태 — 톤/색만 갱신하면 됨.
- `/simulation`, `/details`(가이드 허브), `/guide/:id` 5종은 **아직 우리 쪽에 대응 화면이 전혀 없음**.

---

## 5. 다음 단계 제안 (참고용, 실행 안 함)
1. 백엔드 팀과 회원가입 필드셋 불일치(4-1) 확인 — 어느 쪽을 기준으로 맞출지 결정 필요.
2. Tailwind 팔레트를 `primary`/`accent`/`foreground` 체계로 교체.
3. 하단 네비를 라이트 톤 + Home/Calendar/Details/Settings로 재작업 (현재 `/search` 라우트·페이지 정리 필요).
4. `/details`, `/guide/:id`, `/simulation` 화면 신규 구현.

이번 작업 범위는 크롤링 + 감사 문서화까지이며, 위 반영 작업은 착수하지 않았음.
