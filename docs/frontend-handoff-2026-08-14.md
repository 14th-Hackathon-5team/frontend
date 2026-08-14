# 프론트엔드 팀원 전달사항 (신재호, 2026-08-14)

방금 전화로 협의한 내용 정리. `design` 브랜치 기준.

## 담당하기로 한 작업

### 1. 다국어 지원 (한국어/영어) — 우선순위 높음
- 현재 앱 전체가 영어 텍스트로 하드코딩되어 있고, i18n 라이브러리는 아직 미설치 상태 (`react-i18next` 등 없음).
- `src/pages/LanguageSelect.jsx`는 UI만 있고 선택값을 저장/적용하지 않음 — `Continue` 클릭 시 그냥 `/login`으로 이동만 함.
- 백엔드는 이미 `language` 필드를 `KOREAN` / `ENGLISH` 2종으로 받아서 저장함 (`docs/backend-notes-2026-08-13.md` 참고). 회원가입 완료 시점(`POST /api/users/me`)에 선택한 언어값을 실어 보내야 함.
- 요구사항: 한국어 / 영어 두 언어 모두 전체 화면에서 지원되도록 구현.

### 2. 아직 구현 못한 나머지 기능들
파일별로 TODO 주석 남겨둠, 상세 내용:
- `src/lib/axios.js` — 401 처리 (accessToken 재발급, 로그아웃, 로그인 페이지 리다이렉트)
- `src/pages/Home.jsx` — 체크리스트 실제 API 연동 (현재 `COMMON_CHECKLIST` / `MY_CHECKLIST` 하드코딩, 사용자 이름만 `getMyInfo`로 연동된 상태)
- `src/pages/Calendar.jsx` — 실제 일정 데이터 API 연동 (현재 `EVENTS` 하드코딩)
- `src/pages/Settings.jsx` — 프로필 정보 API 연동 (현재 `PROFILE` 하드코딩), 각 설정 항목 클릭 시 상세 화면 연결

## 디자인 디테일
그 외 디자인 디테일 부분은 팀원 재량으로 진행.

## 생활비 계산기 (`src/pages/Simulation.jsx`) — 이번 작업 범위 아님
- 현재 사용자가 어떤 항목을 선택하든 결과값(`RESULT_BREAKDOWN`, `RESULT_TOTAL`, `RESULT_INCOME`, `RESULT_ESTIMATE`, `Simulation.jsx:41-48`)이 고정되어 있어서 기능이 이상하게 동작함. 실제 비용 산정 로직이 아직 없음.
- 일요일(2026-08-16) 팀회의에서 계산 로직 논의 후 별도로 수정 예정. 지금은 손대지 않고 그대로 둠.

## 진행 상황 업데이트 (2026-08-15)

배포된 스웨거(`http://13.125.17.105:8080/swagger-ui/index.html`) 기준으로 API 연동 작업 진행함.

### 완료
- `src/lib/axios.js` — 401 시 로그아웃 + `/login` 리다이렉트 (재발급 API가 스웨거에 없어서 재발급 로직은 구현 못 함)
- `src/pages/Home.jsx` — 상단 ADMIN_INFO(비자/외국인등록/체류만료일)를 `GET /api/users/me`로 연동
- `src/pages/Calendar.jsx` — `GET /api/calendar/events`로 월별 일정 연동, 일정 클릭 시 상세 화면(`/calendar/:eventId`, 신규) 추가
- `src/pages/Settings.jsx` — 프로필(`GET /api/users/me`), 언어·알림 설정(`GET/PATCH /api/settings/me*`) 연동. "Edit Profile" 눌렀을 때 이동할 프로필 수정 화면(`/settings/edit-profile`, 신규) 추가
- `src/pages/Details.jsx`, `GuideDetail.jsx` — 정적 콘텐츠(`constants/guides.js`, 삭제함) 대신 `GET /api/guides`, `GET /api/guides/{guideId}` 연동. 백엔드 응답이 title/content/링크만 줘서 예전의 단계별 안내·팁·FAQ 구성은 없어짐
- 로그인 안 한 상태로 주요 화면 접근 못 하게 라우트 보호(`ProtectedRoute`) 추가
- `LanguageSelect.jsx` 선택값을 저장(localStorage)해서 회원가입 폼 언어 필드 기본값으로 넘어가게 연동

### 아직 안 됨 / 막혀있음
- **다국어(1번 항목) 자체는 손 안 댐** — 이번엔 "언어 관련 API 연동"까지만 진행, `react-i18next` 설치 및 화면 텍스트 한/영 번역은 별도 작업으로 남아있음
- **Home 체크리스트**(`COMMON_CHECKLIST`/`MY_CHECKLIST`)는 여전히 하드코딩 — 스웨거에 대응하는 체크리스트 API 자체가 없음. 백엔드에 API 필요 여부 확인 필요
- **회원 탈퇴 API 없음** — Settings의 "Delete Account" 버튼 계속 비활성 상태. 백엔드에 요청해둠
- **가이드 콘텐츠가 비어있음** — `GET /api/guides` 연동은 됐는데 DB에 실제 글이 없어서 Details 화면에 전부 "No guides yet." 뜸. 백엔드에 콘텐츠 입력 요청해둠
- Settings의 Subscription/Billing/Legal/Support 항목들은 대응 API·화면이 없어서 계속 비활성 버튼
