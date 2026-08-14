# [요청 → 반려됨] 회원가입 API 필드셋 - 최종 디자인 기준으로 업데이트 요청

> **상태: 반려 (2026-08-13, 고재민)**
> 백엔드는 아래 요청을 채택하지 않고 최초 스펙(14개 필드, 기존 enum)을 그대로 유지하기로 함.
> 대신 새로운 필수 필드 `language`(`KOREAN`/`ENGLISH` 2종)가 추가됨.
> 상세: [backend-notes-2026-08-13.md](./backend-notes-2026-08-13.md)
> FE 구현은 이 문서의 "요청"이 아니라 위 노트 기준으로 되돌림 — 아래 내용은 기록용으로만 남겨둠.

---

안녕하세요, FE팀입니다.
최종 디자인이 확정되어(`https://tqwhyl.readdy.co`), **디자인을 기준으로 프론트엔드 구현을 진행**하기로 했습니다. 그에 맞춰 8/13에 공유해주신 `POST /api/users/me` 스펙에서 아래 변경이 필요해 요청드립니다.

디자인 원본: https://tqwhyl.readdy.co/signup/profile (1~3단계)

---

## 요청 1. 아래 필드는 회원가입 API에서 제거(또는 선택값化) 요청

디자인 3단계 어디에도 입력 UI가 없는 필드입니다. 회원가입 시점엔 값을 받을 방법이 없으니, 아래 중 하나로 처리 부탁드립니다.
- (A) 회원가입 API에서 제거하고 필수값에서 빼주시거나
- (B) 가입 이후 마이페이지(`PATCH /api/users/me` 등, 아직 미확정)에서 별도로 받는 방식으로 이동

대상 필드:
- `hasAlienRegistration` (외국인등록 여부)
- `stayExpirationDate` (체류 만료일)
- `isParentSupported` (부모 지원 여부)
- `partTimeStatus` (알바 상태)
- `currentTopikLevel` (현재 토픽)

## 요청 2. 아래 필드를 회원가입 Request Body에 추가 요청

디자인엔 입력 UI가 있는데 현재 스펙엔 없는 필드입니다.

| 필드명(제안) | 타입 | 설명 |
|---|---|---|
| `visaIssueDate` | string (`YYYY-MM-DD`) | 비자 발급일 (2단계 "Visa Issue Date") |
| `language` | string enum | 선호 언어 — 값: `EN`, `KO`, `ZH`, `JA`, `VI` (디자인 표시: English/한국어/中文/日本語/Tiếng Việt) |

## 요청 3. 아래 필드는 타입/값 범위를 디자인 기준으로 변경 요청

| 필드 | 현재 스펙 | 변경 요청 |
|---|---|---|
| 생년 정보 | `birthYear` (숫자, 예: `2000`) | **`birthDate` (string, `YYYY-MM-DD`)로 변경** — 디자인은 생년월일 전체를 받음 |
| `nationality` | 자유 문자열 | **8개 고정 enum으로 변경**: `US, CN, JP, VN, PH, ID, TH, OTHER` |
| `userStatus` | 7개 enum(`BEFORE_ENTRY, HIGH_SCHOOL, LANGUAGE_STUDENT, UNDERGRADUATE, GRADUATE, EXCHANGE_STUDENT, OTHER`) | **4개로 축소**: `STUDENT, WORKER, JOB_SEEKER, OTHER` |
| `visaType` | 7개 enum(`D2, D4, H1, F2, F5, F6, OTHER`) | **자유 문자열로 변경** — 디자인은 텍스트 입력 |
| `housingType` | 6개 enum(`DORMITORY, RENT, HOMESTAY, GOSIWON, SHARE_HOUSE, OTHER`) | **3개로 축소**: `DORMITORY, SELF, GOSIWON` (`SELF`가 기존 `RENT` 대응) |
| `targetTopikLevel` | 7개 enum(`NONE, LEVEL_1~6`) | **`NONE` 제외, `LEVEL_1~6`만** |

---

## 참고 — 변경 후 최종 Request Body 예시 (프론트 기준)

```json
{
  "name": "Test User",
  "birthDate": "2000-01-01",
  "nationality": "US",
  "userStatus": "STUDENT",
  "schoolName": "Test University",
  "visaType": "D-2",
  "visaIssueDate": "2024-01-01",
  "entryDate": "2025-03-01",
  "housingType": "DORMITORY",
  "language": "EN",
  "targetTopikLevel": "LEVEL_3"
}
```

## 일정 관련

프론트는 이번 주부터 위 필드 기준으로 회원가입 화면 구현을 진행합니다. API가 바로 안 바뀌더라도 우선 화면/폼은 디자인 기준으로 완성해두고, 실제 연동(payload 필드명·enum 값)은 백엔드 변경에 맞춰 마지막에 맞추겠습니다. 위 내용 검토 후 가능/불가능 여부와 최종 필드명만 회신 주시면 됩니다.
