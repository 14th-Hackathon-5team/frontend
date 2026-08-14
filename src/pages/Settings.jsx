import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useLanguageStore from '../store/languageStore'
import { getMyInfo } from '../lib/authApi'
import { getSettings, updateLanguageSetting, updateAlarmSetting } from '../lib/settingsApi'

const LANGUAGE_LABEL = { KOREAN: '한국어', ENGLISH: 'English' }
const ALARM_LABEL = { ALL: 'All', ESSENTAL_ONLY: 'Essential Only', NONE: 'None' }
const ALARM_CYCLE = ['ALL', 'ESSENTAL_ONLY', 'NONE']

// 그 외 섹션(Subscription/Billing/Legal/Support)은 대응하는 API·화면이 아직 없어 클릭해도 동작 안 함.
const STATIC_SECTIONS = [
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

// 설정 화면 — 프로필은 GET /api/users/me, 언어/알림은 GET·PATCH /api/settings/me* 연동.
function Settings() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const setPreferredLanguage = useLanguageStore((state) => state.setPreferredLanguage)

  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getMyInfo()
      .then((response) => setProfile(response.data.data))
      .catch((error) => console.error('[Settings] 내 정보 조회 실패', error))
    getSettings()
      .then((response) => setSettings(response.data.data))
      .catch((error) => console.error('[Settings] 설정 조회 실패', error))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const cycleLanguage = () => {
    if (!settings) return
    const next = settings.preferredLanguage === 'KOREAN' ? 'ENGLISH' : 'KOREAN'
    updateLanguageSetting(next)
      .then((response) => {
        setSettings(response.data.data)
        setPreferredLanguage(next)
      })
      .catch((error) => console.error('[Settings] 언어 설정 변경 실패', error))
  }

  const cycleAlarm = () => {
    if (!settings) return
    const currentIndex = ALARM_CYCLE.indexOf(settings.alarmSetting)
    const next = ALARM_CYCLE[(currentIndex + 1) % ALARM_CYCLE.length]
    updateAlarmSetting(next)
      .then((response) => setSettings(response.data.data))
      .catch((error) => console.error('[Settings] 알림 설정 변경 실패', error))
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-500 bg-accent-100 text-2xl">
          🙂
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-foreground-950">{profile?.name ?? '...'}</p>
          <p className="text-sm text-foreground-500">
            {profile ? `${profile.schoolName} · ${profile.visaType}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings/edit-profile')}
          className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Edit Profile
        </button>
      </div>

      <hr className="mb-6 border-background-200" />

      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold tracking-wide text-foreground-500">ACCOUNT</p>
        <div className="divide-y divide-background-200 overflow-hidden rounded-2xl border border-background-200 bg-background-50">
          <button
            type="button"
            onClick={cycleLanguage}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            Language
            <span className="flex items-center gap-2 text-foreground-400">
              <span className="text-sm">{settings ? LANGUAGE_LABEL[settings.preferredLanguage] : '...'}</span>
              <span>›</span>
            </span>
          </button>
          <button
            type="button"
            onClick={cycleAlarm}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            Notifications
            <span className="flex items-center gap-2 text-foreground-400">
              <span className="text-sm">{settings ? ALARM_LABEL[settings.alarmSetting] : '...'}</span>
              <span>›</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings/edit-profile')}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            Edit Profile
            <span className="text-foreground-400">›</span>
          </button>
        </div>
      </div>

      {STATIC_SECTIONS.map((section) => (
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
        {/* TODO: 회원 탈퇴 API가 아직 없음 — 백엔드 확정 후 연동 */}
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
