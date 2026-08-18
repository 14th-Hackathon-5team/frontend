import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import useLanguageStore from '../store/languageStore'
import { getMyInfo, deleteAccount } from '../lib/authApi'
import { getSettings, updateLanguageSetting, updateAlarmSetting } from '../lib/settingsApi'
import LanguageModal from '../components/LanguageModal'

const ALARM_CYCLE = ['ALL', 'ESSENTIAL_ONLY', 'NONE']

// 설정 화면 — 프로필은 GET /api/users/me, 언어/알림은 GET·PATCH /api/settings/me* 연동.
function Settings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const setPreferredLanguage = useLanguageStore((state) => state.setPreferredLanguage)

  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)
  const [languageModalOpen, setLanguageModalOpen] = useState(false)

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

  const handleDeleteAccount = () => {
    if (!window.confirm(t('settings.deleteConfirm'))) return
    deleteAccount()
      .then(() => {
        logout()
        navigate('/login', { replace: true })
      })
      .catch((error) => {
        console.error('[Settings] 회원 탈퇴 실패', error)
        window.alert(t('settings.deleteError'))
      })
  }

  const handleSelectLanguage = (next) => {
    updateLanguageSetting(next)
      .then((response) => {
        setSettings(response.data.data)
        setPreferredLanguage(next)
        setLanguageModalOpen(false)
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
          {t('settings.editProfile')}
        </button>
      </div>

      <hr className="mb-6 border-background-200" />

      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold tracking-wide text-black">{t('settings.account')}</p>
        <div className="divide-y divide-background-200">
          <button
            type="button"
            onClick={() => setLanguageModalOpen(true)}
            className="flex w-full items-center justify-between py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            {t('settings.language')}
            <span className="flex items-center gap-2 text-foreground-400">
              <span className="text-sm">{settings ? t(`enums.language.${settings.language}`) : '...'}</span>
              <span>›</span>
            </span>
          </button>
          <button
            type="button"
            onClick={cycleAlarm}
            className="flex w-full items-center justify-between py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            {t('settings.notifications')}
            <span className="flex items-center gap-2 text-foreground-400">
              <span className="text-sm">{settings ? t(`enums.alarm.${settings.alarmSetting}`) : '...'}</span>
              <span>›</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings/edit-profile')}
            className="flex w-full items-center justify-between py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
          >
            {t('settings.editProfile')}
            <span className="text-foreground-400">›</span>
          </button>
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold tracking-wide text-black">{t('settings.accountManagement')}</p>
      <div className="divide-y divide-background-200">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-between py-3 text-left text-sm text-foreground-900 transition-colors hover:bg-primary-50"
        >
          {t('settings.logout')}
          <span className="text-foreground-400">›</span>
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="flex w-full items-center justify-between py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
        >
          {t('settings.deleteAccount')}
          <span className="text-foreground-400">›</span>
        </button>
      </div>

      {languageModalOpen && (
        <LanguageModal
          current={settings?.language}
          onSelect={handleSelectLanguage}
          onClose={() => setLanguageModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Settings
