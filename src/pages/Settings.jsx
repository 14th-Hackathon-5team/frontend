import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// TODO: 프로필 정보는 GET /api/users/me 연동 전까지 예시 데이터 사용.
const PROFILE = { name: 'Hong Gil-dong', school: 'Sungkonghoe University', visa: 'D-2' }

const SECTIONS = [
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Language', value: 'English' },
      { label: 'Notifications' },
      { label: 'Edit Profile' },
    ],
  },
  {
    title: 'SUBSCRIPTION & BILLING',
    items: [{ label: 'Subscription' }, { label: 'Billing & Payments' }],
  },
  {
    title: 'LEGAL INFORMATION',
    items: [{ label: 'Terms & Privacy Consent' }, { label: 'Privacy Policy' }, { label: 'Legal & Other Information' }],
  },
  {
    title: 'SUPPORT',
    items: [{ label: 'Support' }, { label: 'Version', value: '1.0.0' }],
  },
]

// 설정 화면 — 최종 디자인(tqwhyl.readdy.co/settings) 반영.
// TODO: 각 항목 클릭 시 상세 화면은 백엔드 API/기획 확정 후 연결.
function Settings() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    console.log('[Settings] 로그아웃')
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-500 bg-accent-100 text-2xl">
          🙂
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-foreground-950">{PROFILE.name}</p>
          <p className="text-sm text-foreground-500">
            {PROFILE.school} · {PROFILE.visa}
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Edit Profile
        </button>
      </div>

      <hr className="mb-6 border-background-200" />

      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="mb-2 text-xs font-semibold tracking-wide text-foreground-500">{section.title}</p>
          <div className="divide-y divide-background-200 overflow-hidden rounded-2xl border border-background-200 bg-background-50">
            {section.items.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
              >
                {item.label}
                <span className="flex items-center gap-2 text-foreground-400">
                  {item.value && <span className="text-sm">{item.value}</span>}
                  <span>›</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="mb-2 text-xs font-semibold tracking-wide text-foreground-500">ACCOUNT MANAGEMENT</p>
      <div className="divide-y divide-background-200 rounded-2xl border border-background-200 bg-background-50">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
        >
          Log Out
          <span className="text-foreground-400">›</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
        >
          Delete Account
          <span className="text-foreground-400">›</span>
        </button>
      </div>
    </div>
  )
}

export default Settings
