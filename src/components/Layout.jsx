import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

// 하단 네비게이션이 있는 탭 화면(홈/캘린더/세부정보/설정) 공통 레이아웃.
// 최종 디자인(tqwhyl.readdy.co) 기준 크림 배경.
function Layout() {
  return (
    <div className="min-h-screen bg-background-50 text-foreground-950">
      <div style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom) + 16px)' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default Layout
