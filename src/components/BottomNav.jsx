import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    to: '/details',
    label: 'Details',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

// 최종 디자인 기준 라이트 테마 하단 네비게이션 (4탭: Home/Calendar/Details/Settings — 검색 탭 없음)
// 탭 영역은 60px 고정, 홈 인디케이터가 있는 기기는 safe-area만큼 아래로 더 여백을 줌.
// max-w-[430px]/mx-auto는 App.jsx의 앱 폭과 맞춰서, 넓은 화면에서도 네비가 콘텐츠 아래 중앙에 오도록 함.
function BottomNav() {
  return (
    <nav
      className="glass-nav fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-[430px] items-stretch justify-around"
      style={{ height: 'calc(60px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center transition-colors ${
              isActive ? 'text-primary-500' : 'text-foreground-400 hover:text-primary-400'
            }`
          }
        >
          {icon()}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
