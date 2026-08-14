import api from './axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

export function startGoogleLogin() {
  console.log('[authApi] Google OAuth 로그인 시작')
  window.location.href = `${baseURL}/oauth2/authorization/google`
}

export function startKakaoLogin() {
  console.log('[authApi] Kakao OAuth 로그인 시작')
  window.location.href = `${baseURL}/oauth2/authorization/kakao`
}

// 회원가입 시점에는 아직 accessToken이 없으므로 signupToken을 직접 헤더에 실어서 호출한다.
export function signup(signupToken, payload) {
  console.log('[authApi] 회원가입 요청', payload)
  return api.post('/api/users/me', payload, {
    headers: {
      Authorization: `Bearer ${signupToken}`,
    },
  })
}

// 내 정보 조회 (docs/backend-notes-2026-08-13.md 2절) — accessToken은 api 인터셉터가 자동으로 실어줌.
export function getMyInfo() {
  return api.get('/api/users/me')
}
