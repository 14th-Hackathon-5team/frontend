// 로컬에서 디자인을 확인할 때 OAuth 로그인 없이 화면에 들어갈 수 있게 해주는 개발용 우회.
// import.meta.env.DEV로 막아두어 프로덕션 빌드에서는 항상 false가 되고 번들에서도 제거된다.
//
// .env.local 에 아래 두 줄을 넣고 `npm run dev`를 다시 실행하면 켜진다.
//   VITE_DEV_BYPASS_AUTH=true
//   VITE_DEV_ACCESS_TOKEN=<배포 사이트에서 발급받은 실제 토큰>  # 비워두면 더미 토큰 사용
//
// 실제 토큰을 넣으면 vite 프록시를 통해 백엔드 API도 그대로 붙는다.
// 비워두면 화면은 뜨지만 API 호출은 401이 나므로, API를 쓰지 않는 화면(생활비 시뮬레이터 등)만 확인 가능.
export const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

const DUMMY_TOKEN = 'dev-local-token'

export function applyDevAuth() {
  if (!DEV_BYPASS_AUTH) return

  const token = import.meta.env.VITE_DEV_ACCESS_TOKEN || DUMMY_TOKEN
  if (localStorage.getItem('accessToken') !== token) {
    localStorage.setItem('accessToken', token)
  }
  if (!localStorage.getItem('preferredLanguage')) {
    localStorage.setItem('preferredLanguage', import.meta.env.VITE_DEV_LANGUAGE || 'KOREAN')
  }

  console.log(
    `[devAuth] 로그인 우회 활성화 — ${import.meta.env.VITE_DEV_ACCESS_TOKEN ? '실제 토큰' : '더미 토큰(API는 401)'}`,
  )
}

// i18n·authStore가 localStorage를 읽기 전에 값이 들어가야 하므로 모듈 로드 시점에 바로 실행한다.
applyDevAuth()
