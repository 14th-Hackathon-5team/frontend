# 이어서 작업하기 가이드 (신재호, 2026-08-14)

이번에 담당하기로 한 작업(`docs/frontend-handoff-2026-08-14.md` 참고) 시작하기 전에 로컬 환경 세팅하는 방법.

## 1. 저장소 받기

```bash
git clone https://github.com/14th-Hackathon-5team/frontend.git
cd frontend
git checkout design
```

이미 클론되어 있으면:

```bash
git fetch origin
git checkout design
git pull
```

## 2. 환경 변수 설정

`.env.example`을 복사해서 `.env` 생성 (`.env`는 git에 안 올라감):

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8080
```

백엔드를 로컬에서 안 띄우고 EC2 서버 쓰는 경우, 팀 채널에서 백엔드 서버 주소 확인해서 값 교체.

## 3. 설치 & 실행

```bash
npm install
npm run dev
```

- 포트 3000 고정 (`vite.config.js`).
- 로컬 dev에서는 `/api` 요청이 `vite.config.js`의 프록시를 거쳐 백엔드로 감 — 백엔드 EC2에 CORS 설정이 없어서 직접 호출하면 브라우저가 막기 때문. 이 프록시 + `src/lib/axios.js`의 `import.meta.env.DEV` 분기는 백엔드에 CORS가 추가되면 같이 제거 가능.

## 4. 작업 전에 읽어두면 좋은 문서

- `docs/frontend-handoff-2026-08-14.md` — 이번에 맡은 작업 범위
- `docs/backend-notes-2026-08-13.md` — 인증 흐름, API 스펙, `language` 필드(`KOREAN`/`ENGLISH`) 관련 백엔드 확정 사항
- `docs/design-audit.md`, `docs/design-urls.md` — 디자인 원본 레퍼런스
- `docs/screenshots/` — 화면별 최종 디자인 스크린샷

## 5. 코드에서 TODO 찾는 법

작업 대상 표시해둔 부분은 전부 `TODO` 주석으로 남겨둠:

```bash
grep -rn "TODO" src/
```

- `src/lib/axios.js:25` — 401 처리
- `src/pages/Home.jsx:6` — 체크리스트 API 연동
- `src/pages/Calendar.jsx:6` — 일정 API 연동
- `src/pages/Settings.jsx:4,31` — 프로필 API 연동, 설정 항목 상세화면
- `src/pages/Simulation.jsx:40` — **이번엔 건드리지 않기로 함.** 일요일(8/16) 회의 후 별도 처리.

## 6. 다국어(한국어/영어) 작업 시 참고

- 현재 i18n 라이브러리 미설치 — `react-i18next` 등 자유롭게 골라서 추가하면 됨.
- `src/pages/LanguageSelect.jsx`에 언어 선택 UI는 이미 있지만 선택값을 어디에도 저장 안 함 — 여기서 고른 값을 전역 상태(예: `zustand` — `src/store/authStore.js` 참고)나 로컬스토리지에 저장해서 앱 전체에 적용해야 함.
- 회원가입 완료 시(`POST /api/users/me`) `language` 필드로 `"KOREAN"` / `"ENGLISH"` 중 하나를 실어 보내야 함 (`docs/backend-notes-2026-08-13.md` 5번 참고).

## 7. 개발 편의 명령어

```bash
npm run lint   # oxlint
npm run build  # 프로덕션 빌드 확인
```

## 8. 작업 올릴 때

- 커밋 전에 `.env`가 스테이징 안 됐는지 확인 (`.gitignore`에 이미 걸려있긴 함).
- 작업 범위가 크면 `design`에서 별도 브랜치 파서 작업하고 PR 열어도 되고, 바로 `design`에 커밋해도 됨 — 편한 쪽으로. 헷갈리면 물어보기.
