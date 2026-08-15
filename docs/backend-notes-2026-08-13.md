# 백엔드 전달 사항 (고재민, 2026-08-13)

`develop` 브랜치 기준 백엔드 구현 현황 공유 — FE 구현 시 이 문서를 기준으로 함.

## 인증 흐름
- 소셜 로그인(Google/Kakao) 성공 후 JWT 2종 발급
  - `SIGNUP_TOKEN`: 회원가입 정보 입력용
  - `ACCESS_TOKEN`: 회원가입 완료 후 일반 API 이용용

## 1. 회원가입 — `POST /api/users/me`
- 인증: `Authorization: Bearer {SIGNUP_TOKEN}`
- 성공 시 `ACCESS_TOKEN` 발급
- **`language` 필수** — 값: `KOREAN` / `ENGLISH` (2종만 지원)

Request 예시:
```json
{
  "name": "홍길동",
  "nationality": "KR",
  "birthYear": 2000,
  "userStatus": "UNDERGRADUATE",
  "schoolName": "ABC University",
  "entryDate": "2026-03-01",
  "visaType": "D2",
  "hasAlienRegistration": true,
  "stayExpirationDate": "2027-03-01",
  "housingType": "DORMITORY",
  "isParentSupported": true,
  "partTimeStatus": "NOT_WORKING",
  "currentTopikLevel": "LEVEL_3",
  "targetTopikLevel": "LEVEL_5",
  "language": "ENGLISH"
}
```

✅ **해결됨 (2026-08-14)**: 배포된 서버 스웨거로 확인한 결과 `partTimeStatus` enum은 `WORKING, SEARCHING, NOT_PLANNED` — 위 예시의 `NOT_WORKING`은 오타였음. FE는 계속 `NOT_PLANNED` 사용.

## 2. 내 정보 조회 — `GET /api/users/me`
- 인증: `Authorization: Bearer {ACCESS_TOKEN}`
- 응답에 `language` 포함, 형식은 회원가입 Request와 동일 + `id`, `email` 등 메타 필드 추가된 형태 예상

## 3. 내 정보 수정 — `PATCH /api/users/me`
- 인증: `Authorization: Bearer {ACCESS_TOKEN}`
- **부분 수정** — 보낸 필드만 변경, 나머지는 기존 값 유지
- 수정 요청에 포함하면 안 되는 필드: `id`, `provider`, `providerId`, `email`, `createdAt`, `updatedAt`

## 4. 언어 선택 (와이어프레임 "언어 선택" 화면)
- OAuth 로그인 요청 자체에는 언어 값을 포함하지 않음
- **회원가입 완료 시점(`POST /api/users/me`)에 `language`로 저장**
- 즉, 로그인 전 언어 선택 UI를 만들더라도 그 값은 회원가입 API 호출 때 실어서 보내야 함

## 5. 화면 표시 ↔ 백엔드 값 매핑

| 화면 표시 | 백엔드 값 |
|---|---|
| 한국어 | `KOREAN` |
| English | `ENGLISH` |

## 6. Swagger
- 백엔드 서버 배포 완료, 공용 Swagger 주소 접근 가능: http://13.125.17.105:8080/swagger-ui/index.html (2026-08-14 확인)
- (기존 로컬 전용 주소 `localhost:8080/swagger-ui/index.html`은 백엔드 개발자 PC에서만 유효했던 값 — 더는 사용 안 함)
- 애매한 부분은 여전히 백엔드에 문의

## 7. 국적(`nationality`) 계약 확정 (2026-08-16)
- 타입: `string` 유지
- 값: **ISO 3166-1 alpha-2 국가 코드** — 예: 대한민국 `KR`, 중국 `CN`, 베트남 `VN`, 일본 `JP`, 미국 `US`
- 화면에는 국가명 표시, API 요청/응답에는 국가 코드만 사용
- 회원가입(`POST`) / 회원정보 수정(`PATCH`) / 회원정보 조회(`GET`) 모두 동일 규칙
- 기존에 논의됐던 자유 텍스트 방식(`"China"`, `"중국"` 등)은 **사용하지 않음**으로 통일

## 8. 회원 탈퇴 API — 미구현 (2026-08-16 기준)
- 아직 백엔드에 엔드포인트 없음
- FE는 `Settings`의 "Delete Account" 버튼을 비활성 상태로 유지 (`src/pages/Settings.jsx:161` TODO 참고), 구현 요청은 넣어둔 상태

## FE 반영 상태
- `src/pages/Signup.jsx`, `src/constants/userEnums.js`를 이 스펙 기준으로 다시 맞춤 (디자인 프로토타입의 간소화된 필드 대신 이 문서의 14개 필드 + `language`를 사용).
- `docs/backend-signup-fieldset-diff.md`에 남겨뒀던 필드 축소 요청은 **백엔드가 채택하지 않음** — 해당 문서 상태 업데이트함.
- `nationality`는 `src/constants/userEnums.js`의 `NATIONALITY_OPTIONS`가 이미 alpha-2 코드를 `value`로 쓰고 있어서 7번 계약과 구조적으로는 이미 일치함 (자유 텍스트 아님). 다만 표시 라벨이 `userEnums.js`에 하드코딩된 한국어 고정값이라 영어 UI에서도 한국어로 뜸 — `src/locales/{ko,en}.json`에 `nationality.*` 번역은 이미 있는데 `Signup.jsx`/`EditProfile.jsx`가 `useTranslation`으로 안 묶여 있어서 아직 못 씀. 이건 기존에 남은 i18n 화면 연결 작업(`docs/frontend-handoff-2026-08-14.md`)에서 같이 처리하면 됨.
