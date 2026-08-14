import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// accessToken이 없으면 로그인 화면으로 보냄 — 모든 API가 ACCESS_TOKEN 인증을 요구하므로
// 비로그인 상태에서 화면에 들어와도 데이터 연동이 되지 않는 문제를 막기 위함.
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
