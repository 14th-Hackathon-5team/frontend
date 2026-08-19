import axios from 'axios'

// 서울 열린데이터광장 Open API — 서울외국인포털 채용공고(SERVICE=GlobalJobSearch).
// https://data.seoul.go.kr/dataList/OA-15732/S/1/datasetView.do 의 "미리보기 > Open API" 탭에서 확인한
// 실제 스펙: http://openapi.seoul.go.kr:8088/(인증키)/(타입)/GlobalJobSearch/(시작)/(끝)/
// 우리 백엔드(./axios.js의 api 인스턴스)와는 무관한 완전 별개의 외부 공공 API라 별도 axios 인스턴스를 씀
// — 우리 로그인 토큰을 이 요청에 실어보내면 안 되기 때문.
const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_API_KEY

// 로컬 dev는 vite.config.js의 /seoul-api 프록시를 거침(이 API도 CORS 미지원 + HTTP 평문이라
// 배포 환경(HTTPS)에서는 브라우저가 혼합 콘텐츠로 직접 차단할 가능성이 높음 — 알려진 제약사항).
const SEOUL_API_BASE = import.meta.env.DEV ? '/seoul-api' : 'http://openapi.seoul.go.kr:8088'

// 서울외국인포털 채용공고 목록 조회 — startIndex/endIndex는 1부터 시작하는 페이징 범위.
export function getSeoulForeignerJobs(startIndex = 1, endIndex = 15) {
  return axios.get(`${SEOUL_API_BASE}/${SEOUL_API_KEY}/json/GlobalJobSearch/${startIndex}/${endIndex}/`)
}
