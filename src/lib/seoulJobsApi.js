import api from './axios'

// 서울외국인포털 채용공고(서울 열린데이터광장 GlobalJobSearch)를 백엔드가 대신 호출해서 내려주는 프록시
// — GET /api/external/seoul-jobs. 원래는 프론트에서 서울 Open API(HTTP 평문)를 직접 호출했는데,
// HTTPS 배포 환경에서 브라우저가 mixed-content로 요청 자체를 막아서 백엔드에 프록시를 요청해 만들어짐
// (2026-08-21 배포 확인). 우리 백엔드를 거치므로 일반 로그인 토큰이 실린 api 인스턴스를 그대로 씀.
export function getSeoulForeignerJobs(startIndex = 1, endIndex = 15) {
  return api.get('/api/external/seoul-jobs', { params: { startIndex, endIndex } })
}
