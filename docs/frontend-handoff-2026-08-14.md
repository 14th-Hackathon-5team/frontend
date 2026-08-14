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
