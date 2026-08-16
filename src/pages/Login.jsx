import { startGoogleLogin, startKakaoLogin } from '../lib/authApi'
import kBuddyLogo from '../assets/k-buddy_logo.png'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  )
}

// 로그인 화면 — 최종 디자인(tqwhyl.readdy.co/login) 반영.
// 백엔드 OAuth2LoginFailureHandler가 실패 시 ?error=true로 이 화면에 리다이렉트함 —
// 별도 안내 문구 없이 카카오/구글 버튼이 있는 이 화면으로만 돌아오면 되므로 error 파라미터는 그냥 무시함.
function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background-50 px-6 py-12">
      <div />

      <div className="flex flex-col items-center">
        <img src={kBuddyLogo} alt="K-Buddy" className="h-auto w-64 object-contain" />
        <p className="mt-2 text-sm text-foreground-500">Life in Korea, you&apos;re not alone</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={startKakaoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-semibold text-black"
        >
          <span>💬</span>
          Log in with KakaoTalk
        </button>

        <button
          type="button"
          onClick={startGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-background-300 bg-white py-3 text-sm font-semibold text-foreground-800"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="pt-4 text-center text-xs text-foreground-400">
          © 2026 K-Buddy. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
