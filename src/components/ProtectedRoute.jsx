import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useLanguageStore from '../store/languageStore'

// accessToken이 없으면 로그인 화면으로 보냄 — 모든 API가 ACCESS_TOKEN 인증을 요구하므로
// 비로그인 상태에서 화면에 들어와도 데이터 연동이 되지 않는 문제를 막기 위함.
// 언어를 아직 고르지 않은 첫 방문자는 로그인 전에 /language를 먼저 거치게 함.
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const preferredLanguage = useLanguageStore((state) => state.preferredLanguage)

  if (!isAuthenticated) {
    return <Navigate to={preferredLanguage ? '/login' : '/language'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
