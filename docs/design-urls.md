# K-Buddy 디자인 프로토타입 사이트맵

크롤링 대상: https://tqwhyl.readdy.co/login (요청 시작점) — SPA라 `<a href>` 태그가 없어 페이지 내 링크 추출이 불가능했고, 대신 번들 JS(`assets/index-hok3BKwr.js`)에 정의된 React Router 라우트 테이블을 직접 읽어 전체 라우트를 확정함. 코드 스플리팅이 없는 단일 번들이라 이 라우트 테이블이 곧 사이트의 전체 URL 목록임 (총 13개, catch-all `*` 제외).

## 전체 URL 목록

| # | URL | 화면 | 비고 |
|---|-----|------|------|
| 1 | `/` | 언어선택 | "Choose your language" — 진입점. 로그인 여부와 무관하게 항상 이 화면부터 시작하는 것으로 보임 |
| 2 | `/login` | 로그인 | K-Buddy 로고, 카카오/구글 버튼 |
| 3 | `/signup/profile` | 회원가입 (1~3단계) | 라우트는 하나, 컴포넌트 내부 상태로 3단계 진행 (우리 구현과 동일한 패턴) |
| 4 | `/home` | 홈(메인) | 하단 탭 레이아웃 포함 |
| 5 | `/calendar` | 캘린더 | 하단 탭 레이아웃 포함 |
| 6 | `/details` | 세부정보 | 하단 탭 레이아웃 포함. 하단 네비 4번째 탭 이름이 "Details"임 (검색 아님) |
| 7 | `/settings` | 설정 | 하단 탭 레이아웃 포함 |
| 8 | `/simulation` | 생활비 시뮬레이터 (Budget Simulation) | 하단 탭 레이아웃 포함. 홈 화면 "Living Cost Simulator" 배너에서 진입. **와이어프레임 8화면 목록에는 없던 화면** |
| 9 | `/guide/visa` | 가이드 상세 — 비자 (D-2 Student Visa) | 하단 탭 없음(드릴다운 화면) |
| 10 | `/guide/schedule` | 가이드 상세 — 학사일정 (Academic Schedule) | 하단 탭 없음 |
| 11 | `/guide/admissions` | 가이드 상세 — 입학/장학 (Admissions & Scholarships) | 하단 탭 없음 |
| 12 | `/guide/law` | 가이드 상세 — 법/제도 (Law & Your Rights) | 하단 탭 없음 |
| 13 | `/guide/topik` | 가이드 상세 — TOPIK (TOPIK Exam Guide) | 하단 탭 없음 |

라우트 정의상 `/guide/:id` 하나의 동적 라우트이며, 실제 사용되는 `id` 값 5개(`visa`, `schedule`, `admissions`, `law`, `topik`)를 번들에서 함께 확인함 — `/details` 페이지의 카드 5개가 각각 이 5개 URL로 연결됨.

## 화면 구조 요약 (플로우)

```
/  (언어선택)
 └→ /login (로그인)
     ├→ /signup/profile (회원가입 1~3단계, 신규 유저)
     │    └→ /home
     └→ /home (기존 유저)

/home ─┬─ /calendar ─┬─ (하단 탭으로 서로 이동)
       ├─ /details   │
       └─ /settings ─┘
        │
        ├→ /simulation   (홈의 "Living Cost Simulator" 배너)
        └→ /details → /guide/visa | /guide/schedule | /guide/admissions | /guide/law | /guide/topik
```

## 참고: 라우트 확정 방법

`fetch()`로 번들 JS를 받아 React Router 설정 패턴(`path:` + `element:`)을 정규식으로 추출. 코드 스플리팅된 추가 청크가 없음을 확인했으므로(동적 `import()` 없음), 이 목록이 해당 프로토타입의 전체 라우트임.
