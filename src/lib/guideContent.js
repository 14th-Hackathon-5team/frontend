// 백엔드 가이드 content가 아직 태그([SUMMARY]/[STEP] 등) 없이 1~2문장짜리 짧은 평문이라(2026-08-20
// 확인, 7개 가이드 전부 동일), 구조화된 상세 설명을 프론트에서 guideId별로 직접 제공한다.
// GuideDetail.jsx에서 API 응답(guide.content) 파싱이 실패(태그 없음)할 때만 이 폴백을 쓰므로,
// 나중에 백엔드가 실제로 태그를 채워서 내려주기 시작하면 코드 수정 없이 API 콘텐츠가 자동으로 우선 적용된다.
// 법적 사실관계는 이미 앱에 노출된 실제 AI 알림 데이터(details.sourceName: 국가법령정보센터 — 체류기간
// 만료/연장, 외국인등록)를 기준으로 작성했고, 벌금 액수처럼 민감하거나 변동 가능한 수치는 명시하지 않고
// 공식 채널(하이코리아 등) 확인을 안내한다.
// 폴백 콘텐츠도 UI 언어를 따라가야 하므로 ko/en 두 벌을 두고 getGuideContentOverride()로 골라 쓴다.
const KO = {
  // VISA — D-2/D-4 비자 안내
  1: `[SUMMARY]
D-2는 대학(원) 정규 학위과정에 재학 중인 유학생, D-4는 어학연수·교환학생 등 비학위과정에 재학 중인 유학생에게 부여되는 체류자격이에요. 두 자격 모두 학업을 위한 체류를 전제로 하기 때문에 시간제취업이나 자격 변경 시 별도 절차가 필요해요.

[IMPORTANT]
D-2와 D-4는 체류 가능 기간, 시간제취업 허용 범위, 학위과정 진학 시 자격변경 필요 여부가 서로 달라요. 본인이 어느 자격인지 외국인등록증에서 먼저 확인하세요.

[STEP 1]
내 비자 종류 확인하기
외국인등록증 또는 하이코리아(HiKorea) 사이트에서 현재 체류자격이 D-2인지 D-4인지 확인하세요.

[STEP 2]
체류기간 만료일 확인하기
체류기간은 보통 학기·과정 단위로 부여돼요. 만료일이 다가오면 재학증명서 등 서류를 준비해 관할 출입국·외국인청에서 연장허가를 신청하세요.

[STEP 3]
시간제취업 계획 점검하기
아르바이트를 하려면 사전에 시간제취업 허가를 받아야 해요. 학기 중·방학 중 허용 시간이 다르니 학교 국제처나 출입국·외국인청에 문의하세요.

[STEP 4]
학위과정 진학 시 자격변경 검토하기
D-4로 어학연수 중 정규 학위과정에 합격하면 D-2로 자격변경 신청이 필요해요. 합격통지서 등 서류를 미리 준비해두세요.

[CAUTION]
체류자격 외 활동(허가 없는 아르바이트 등)을 하면 불이익을 받을 수 있어요. 정확한 조건은 하이코리아나 관할 출입국·외국인청에서 확인하세요.`,

  // VISA — 외국인등록증 발급 절차
  2: `[SUMMARY]
입국일로부터 90일을 초과해 한국에 체류할 예정인 외국인은 외국인등록을 해야 해요. 등록을 마치면 외국인등록증이 발급되고, 이 카드가 은행 계좌 개설, 휴대폰 개통, 건강보험 가입 등 대부분의 생활 절차에서 신분증으로 쓰여요.

[IMPORTANT]
외국인등록은 입국일로부터 90일 이내에 마쳐야 해요. 기한을 넘기면 불이익이 있을 수 있으니 입국 후 최대한 빨리 신청하는 걸 권장해요.

[STEP 1]
신청 대상 확인하기
90일을 초과하여 체류할 예정인 외국인이 대상이에요. 체류지를 관할하는 지방출입국·외국인관서에 신청해야 해요.

[STEP 2]
서류 준비하기
여권, 사진, 표준입국사증 등 기본 서류와 체류자격별 추가 서류(재학증명서 등)를 준비하세요. 정확한 목록은 하이코리아에서 확인하세요.

[STEP 3]
방문 예약 및 신청하기
하이코리아 사이트·앱에서 사전예약 후 관할 출입국·외국인청을 방문해 신청하세요.

[STEP 4]
등록증 수령하기
접수 후 처리 기간이 지나면 등록증이 발급돼요. 우편 수령과 방문 수령 중 선택할 수 있어요.

[CAUTION]
기한 내 등록하지 않으면 불이익이 있을 수 있어요. 정확한 절차와 서류는 하이코리아(HiKorea)에서 다시 확인하세요.`,

  // TOPIK_APPLICATION — TOPIK 접수 방법 안내
  3: `[SUMMARY]
TOPIK(한국어능력시험)은 topik.go.kr에서 회차별로 정해진 접수기간에만 신청할 수 있어요. 시험장별로 정원이 있어서 인기 지역은 접수 시작 당일 조기 마감되는 경우가 많아요.

[IMPORTANT]
접수 시작일에 서두르지 않으면 원하는 시험장을 놓칠 수 있어요. 접수 일정은 미리 캘린더에 등록해두는 걸 추천해요.

[STEP 1]
회차 및 접수기간 확인하기
topik.go.kr에서 다음 회차 시험일과 접수기간을 확인하세요.

[STEP 2]
회원가입 및 사진 등록하기
접수 전에 미리 회원가입하고 규격에 맞는 증명사진을 등록해두면 접수 당일 시간을 아낄 수 있어요.

[STEP 3]
시험장 및 급수 선택 후 접수하기
접수 시작 시각에 맞춰 원하는 시험장과 응시 급수(TOPIK I / II)를 선택해 접수하세요.

[STEP 4]
응시료 결제 및 접수 확인하기
결제 완료 후 접수확인증을 저장해두고, 이후 안내되는 수험표 출력 기간에 맞춰 수험표를 출력하세요.

[CAUTION]
접수기간이 지나면 추가 접수가 안 될 수 있어요. 시험장·급수별로 조기 마감될 수 있으니 접수 시작 시각에 맞춰 접속하는 게 좋아요.`,

  // TOPIK_EXAM — TOPIK 시험 당일 안내
  4: `[SUMMARY]
TOPIK 시험 당일에는 신분증과 수험표를 반드시 지참해야 하고, 입실 마감 시간이 지나면 응시할 수 없어요. 고사장 위치와 소지품 규정을 미리 확인해두면 당일 당황하지 않아요.

[IMPORTANT]
입실 마감 시간을 지키지 못하면 시험을 볼 수 없어요. 시험 시작 최소 30분~1시간 전 도착을 목표로 이동 계획을 세우세요.

[STEP 1]
준비물 챙기기
신분증(외국인등록증 또는 여권)과 수험표를 반드시 챙기세요. 신분증이 없으면 응시가 거부될 수 있어요.

[STEP 2]
고사장 위치 및 입실 시간 확인하기
수험표에 적힌 고사장 주소와 입실 마감 시간을 미리 확인하고 이동 동선을 계획하세요.

[STEP 3]
소지품 규정 확인하기
휴대폰, 스마트워치 등 전자기기는 시험 중 소지가 금지돼요. 감독관 안내에 따라 지정된 장소에 보관하세요.

[STEP 4]
시험 진행 순서 숙지하기
듣기·쓰기·읽기 순서로 진행되며 영역별 답안 작성 시간이 정해져 있어요. 최신 유의사항은 시험 전 TOPIK 공식 홈페이지에서 확인하세요.

[CAUTION]
부정행위나 규정 위반 시 응시가 무효 처리될 수 있어요. 최신 유의사항은 시험 직전 TOPIK 공식 홈페이지에서 다시 확인하세요.`,

  // LEGAL — 외국인등록 안내
  5: `[SUMMARY]
출입국관리법에 따라 입국일로부터 90일을 초과해 대한민국에 체류하려는 외국인은 외국인등록 의무가 있어요. 이는 단순 행정 절차가 아니라 법으로 정해진 의무 사항이에요.

[IMPORTANT]
외국인등록을 하지 않고 90일을 초과해 체류하면 불법체류 및 행정 제재 대상이 될 수 있어요. 반드시 기한 내에 등록하세요.

[STEP 1]
대상 여부 확인하기
입국일로부터 90일을 초과해 체류할 예정이라면 등록 대상이에요.

[STEP 2]
관할 관서 확인하기
체류지를 관할하는 지방출입국·외국인관서의 장에게 등록 신청을 해야 해요. 관할 관서는 하이코리아에서 주소 기준으로 조회할 수 있어요.

[STEP 3]
필요 서류 준비 및 신청하기
여권, 사진, 체류자격별 증빙서류를 준비해 방문 예약 후 신청하세요.

[STEP 4]
등록증 수령 및 정보 최신화하기
등록증 수령 후에도 체류지·소속 변경 등이 생기면 별도 신고 의무가 있으니 함께 기억해두세요.

[CAUTION]
등록 의무를 이행하지 않으면 행정 제재나 체류 자격에 불이익이 있을 수 있어요. 정확한 법적 기준은 국가법령정보센터 또는 하이코리아에서 확인하세요.`,

  // LEGAL — 체류지 변경신고 안내
  6: `[SUMMARY]
이사 등으로 체류지(거주지)가 바뀐 외국인은 변경된 날로부터 15일 이내에 새로운 체류지를 관할하는 출입국·외국인관서에 체류지 변경신고를 해야 해요.

[IMPORTANT]
신고 기한(15일)을 놓치면 불이익이 있을 수 있어요. 이사 계획이 잡히면 미리 일정에 넣어두는 게 좋아요.

[STEP 1]
이사 여부 및 날짜 확인하기
실제로 새 주소에 거주를 시작한 날을 기준으로 15일 이내 기한을 계산하세요.

[STEP 2]
새 체류지 관할 관서 확인하기
새 주소를 관할하는 지방출입국·외국인관서를 하이코리아에서 확인하세요.

[STEP 3]
필요 서류 준비하기
외국인등록증, 새 주소 증빙(임대차계약서 등)을 준비하세요.

[STEP 4]
방문 또는 온라인으로 신고하기
관할 관서 방문 신고나 정부24·하이코리아를 통한 온라인 신고 가능 여부를 확인하고 진행하세요.

[CAUTION]
신고를 하지 않으면 불이익이 있을 수 있어요. 정확한 절차와 온라인 신고 가능 여부는 하이코리아에서 다시 확인하세요.`,

  // ACADEMIC — 외국인 특별전형 기본 요건
  7: `[SUMMARY]
외국인 특별전형은 국내 대학이 외국인 유학생을 대상으로 별도 정원으로 선발하는 입학 전형이에요. 일반 전형과 달리 수능 없이 서류와 면접 위주로 평가해요.

[IMPORTANT]
국적, 학력, 한국어 능력(TOPIK) 요건을 모두 충족해야 지원 가능해요. 하나라도 미충족 시 서류 접수 자체가 반려될 수 있으니 미리 확인하세요.

[STEP 1]
지원 자격 확인하기
본인과 부모 모두 외국 국적이어야 하고, 본국에서 12년 이상의 정규 교육과정을 마쳤는지 확인하세요.

[STEP 2]
TOPIK 성적 준비하기
많은 대학이 TOPIK 3급 이상을 요구해요. 성적 유효기간이 남아있는지 확인하세요.

[STEP 3]
서류 접수하기
입학지원서, 졸업증명서, 성적증명서, TOPIK 성적표, 재정능력 입증서류를 정해진 기간 안에 제출하세요.

[STEP 4]
면접 응시하기
온라인 화상 면접인 경우가 많아요. 지원 동기와 학업 계획을 한국어로 답변할 준비를 해두세요.

[CAUTION]
대학마다 세부 요건과 제출 서류가 달라요. 반드시 지원하려는 대학의 최신 모집요강을 직접 확인하세요.`,
}

const EN = {
  1: `[SUMMARY]
D-2 is the status of stay granted to students enrolled in a degree program at a university or graduate school, while D-4 is for students in non-degree programs such as language training or exchange programs. Both assume you are staying in Korea to study, so part-time work or changing your status requires a separate procedure.

[IMPORTANT]
D-2 and D-4 differ in how long you may stay, how much part-time work is allowed, and whether you need to change your status when you enter a degree program. Check which status you hold on your Alien Registration Card first.

[STEP 1]
Check your visa type
Confirm whether your current status of stay is D-2 or D-4 on your Alien Registration Card or on the HiKorea website.

[STEP 2]
Check your period of stay expiry date
Your period of stay is usually granted per semester or per program. As the expiry date approaches, prepare documents such as a certificate of enrolment and apply for an extension at your local immigration office.

[STEP 3]
Review your part-time work plan
You must obtain permission for part-time work before you start. The allowed hours differ between semester and vacation periods, so ask your school's international office or your local immigration office.

[STEP 4]
Consider a status change when entering a degree program
If you are on D-4 for language training and are admitted to a regular degree program, you need to apply to change your status to D-2. Prepare documents such as your letter of admission in advance.

[CAUTION]
Engaging in activities outside your status of stay (for example, working part-time without permission) may lead to penalties. Check the exact conditions on HiKorea or with your local immigration office.`,

  2: `[SUMMARY]
Foreign nationals who plan to stay in Korea for more than 90 days from the date of entry must complete alien registration. Once registered, you receive an Alien Registration Card, which serves as your ID for most everyday procedures such as opening a bank account, getting a mobile phone plan, and enrolling in health insurance.

[IMPORTANT]
Alien registration must be completed within 90 days of your entry date. Missing the deadline may lead to penalties, so we recommend applying as soon as possible after arrival.

[STEP 1]
Check whether you need to apply
This applies to foreign nationals planning to stay more than 90 days. You must apply at the immigration office that covers your place of residence.

[STEP 2]
Prepare your documents
Prepare basic documents such as your passport, photo, and visa, plus any additional documents required for your status of stay (for example, a certificate of enrolment). Check the exact list on HiKorea.

[STEP 3]
Book a visit and apply
Make a reservation on the HiKorea website or app, then visit your local immigration office to apply.

[STEP 4]
Receive your card
Your card is issued after the processing period. You can choose between postal delivery and picking it up in person.

[CAUTION]
Failing to register within the deadline may lead to penalties. Double-check the exact procedure and documents on HiKorea.`,

  3: `[SUMMARY]
TOPIK (Test of Proficiency in Korean) can only be applied for at topik.go.kr during the fixed application period for each round. Each test centre has limited capacity, so popular locations often fill up on the first day of applications.

[IMPORTANT]
If you are not quick on the opening day, you may miss the test centre you want. We recommend adding the application dates to your calendar in advance.

[STEP 1]
Check the round and application period
Find the next test date and application period at topik.go.kr.

[STEP 2]
Sign up and upload your photo
Creating your account and uploading a compliant ID photo before applications open saves time on the day.

[STEP 3]
Choose a test centre and level, then apply
When applications open, select your preferred test centre and level (TOPIK I / II) and submit your application.

[STEP 4]
Pay the fee and confirm your application
After payment, save your application confirmation, and print your admission ticket during the announced printing period.

[CAUTION]
Late applications are generally not accepted once the period closes. Centres and levels can fill up early, so log in right when applications open.`,

  4: `[SUMMARY]
On TOPIK test day you must bring your ID and admission ticket, and you cannot sit the test if you arrive after the entry deadline. Checking the test centre location and the rules on personal belongings in advance will save you stress on the day.

[IMPORTANT]
If you miss the entry deadline you cannot take the test. Plan your journey to arrive at least 30 minutes to an hour before the test starts.

[STEP 1]
Pack what you need
Bring your ID (Alien Registration Card or passport) and your admission ticket. Without ID you may be refused entry.

[STEP 2]
Check the test centre location and entry time
Check the address and entry deadline printed on your admission ticket and plan your route in advance.

[STEP 3]
Check the rules on personal belongings
Electronic devices such as mobile phones and smartwatches are not allowed during the test. Store them where the invigilator directs.

[STEP 4]
Understand the test order
The test runs in the order of listening, writing, and reading, with a set time for each section. Check the latest guidelines on the official TOPIK website before the test.

[CAUTION]
Cheating or breaking the rules may invalidate your result. Re-check the latest guidelines on the official TOPIK website shortly before the test.`,

  5: `[SUMMARY]
Under the Immigration Act, foreign nationals who intend to stay in Korea for more than 90 days from their entry date are required to complete alien registration. This is not just an administrative step — it is a legal obligation.

[IMPORTANT]
Staying more than 90 days without registering may make you subject to illegal-stay status and administrative penalties. Be sure to register within the deadline.

[STEP 1]
Check whether this applies to you
If you plan to stay more than 90 days from your entry date, you are required to register.

[STEP 2]
Find the office in charge
You must apply to the head of the local immigration office that covers your place of residence. You can look up the responsible office by address on HiKorea.

[STEP 3]
Prepare documents and apply
Prepare your passport, photo, and the supporting documents required for your status of stay, then book a visit and apply.

[STEP 4]
Receive your card and keep your details current
Even after receiving your card, you have a separate obligation to report changes such as your address or affiliation. Keep this in mind.

[CAUTION]
Failing to meet the registration obligation may lead to administrative penalties or affect your status of stay. Check the exact legal requirements on the Korean Law Information Center or HiKorea.`,

  6: `[SUMMARY]
Foreign nationals whose place of residence has changed — for example after moving house — must report the change to the immigration office covering their new address within 15 days of the change.

[IMPORTANT]
Missing the 15-day reporting deadline may lead to penalties. Once your moving date is set, add it to your schedule in advance.

[STEP 1]
Confirm the move and the date
Count the 15-day deadline from the day you actually began living at the new address.

[STEP 2]
Find the office covering your new address
Look up the local immigration office responsible for your new address on HiKorea.

[STEP 3]
Prepare the documents
Prepare your Alien Registration Card and proof of your new address (such as a lease agreement).

[STEP 4]
Report in person or online
Check whether you can report online via Government24 or HiKorea, or visit the responsible office in person.

[CAUTION]
Failing to report may lead to penalties. Re-check the exact procedure and whether online reporting is available on HiKorea.`,

  7: `[SUMMARY]
The special admission track for foreign students is an admission route where Korean universities select international students under a separate quota. Unlike the general track, it does not require the Korean CSAT and is assessed mainly on documents and an interview.

[IMPORTANT]
You must meet the nationality, education, and Korean proficiency (TOPIK) requirements. If even one is not met, your application may be rejected at the document stage, so check in advance.

[STEP 1]
Check your eligibility
Both you and your parents must hold foreign nationality, and you must have completed 12 or more years of formal education in your home country.

[STEP 2]
Prepare your TOPIK score
Many universities require TOPIK level 3 or above. Check that your score is still within its validity period.

[STEP 3]
Submit your documents
Submit your application form, graduation certificate, academic transcript, TOPIK score report, and proof of financial capability within the given period.

[STEP 4]
Attend the interview
Interviews are often held online by video. Be ready to answer questions about your motivation and study plan in Korean.

[CAUTION]
Requirements and required documents differ by university. Always check the latest admission guidelines of the university you are applying to.`,
}

const BY_LOCALE = { ko: KO, en: EN }

const TITLES_EN = {
  1: 'D-2 / D-4 Student Visa Guide',
  2: 'Getting Your Alien Registration Card',
  3: 'How to Apply for TOPIK',
  4: 'TOPIK Exam Day Guide',
  5: 'Alien Registration',
  6: 'Reporting a Change of Residence',
  7: 'Special Admission for International Students',
}

export function getGuideContentOverride(guideId, locale = 'ko') {
  const table = BY_LOCALE[locale] ?? KO
  return table[guideId] ?? KO[guideId]
}

export function getGuideTitleOverride(guideId, locale = 'ko') {
  if (locale !== 'en') return undefined
  return TITLES_EN[guideId]
}

export const GUIDE_CONTENT_OVERRIDES = KO