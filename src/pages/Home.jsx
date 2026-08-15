import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import birdLogo from '../assets/bird_logo.png'
import { getMyInfo } from '../lib/authApi'
import { VISA_TYPE_OPTIONS } from '../constants/userEnums'

// TODO: 체크리스트는 백엔드에 대응하는 API가 아직 없어(스웨거 확인 완료) 예시 데이터를 그대로 사용.
// guideCategory가 있는 항목은 클릭 시 해당 카테고리의 세부정보(Details) 목록으로 이동.
const COMMON_CHECKLIST = [
  { id: 1, titleKey: 'home.checklist.alienRegistration', dueDate: '2026-08-20', guideCategory: 'VISA' },
  { id: 2, titleKey: 'home.checklist.healthCheckup', dueDate: '2026-08-16', badge: 'D-3' },
  { id: 3, titleKey: 'home.checklist.healthInsurance', dueDate: '2026-09-30' },
]
const MY_CHECKLIST = [
  { id: 4, titleKey: 'home.checklist.topikRegistration', dueDate: '2026-08-15', badge: 'D-2', guideCategory: 'TOPIK' },
  { id: 5, titleKey: 'home.checklist.visaRenewal', dueDate: '2027-02-10', guideCategory: 'VISA' },
  { id: 6, titleKey: 'home.checklist.midtermExam', dueDate: '2026-10-15', guideCategory: 'ACADEMIC' },
]

function formatVisaType(visaType) {
  return VISA_TYPE_OPTIONS.find((option) => option.value === visaType)?.label ?? visaType ?? '-'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const [year, month] = dateString.split('-')
  return `${year}.${month}`
}

function CalculatorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <rect x="7.5" y="6" width="9" height="3.5" rx="1" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />
    </svg>
  )
}

function ChecklistItem({ item, checked, onToggle }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleRowClick = () => {
    if (item.guideCategory) navigate(`/details?category=${item.guideCategory}`)
  }

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center gap-3 rounded-2xl border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50 ${
        item.guideCategory ? 'cursor-pointer' : ''
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        aria-pressed={checked}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? 'border-primary-500 bg-primary-500 text-white' : 'border-background-300 hover:border-primary-400 hover:bg-primary-100'
        }`}
      >
        {checked && '✓'}
      </button>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${checked ? 'text-foreground-400 line-through' : 'text-foreground-900'}`}>
          {t(item.titleKey)}
        </p>
        <p className="text-xs font-semibold text-foreground-500">{t('home.due', { date: item.dueDate })}</p>
      </div>
      {item.badge && (
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-500">
          {item.badge}
        </span>
      )}
      <span className="text-foreground-400">›</span>
    </div>
  )
}

// 메인(홈) 화면 — 최종 디자인(tqwhyl.readdy.co/home) 반영.
function Home() {
  const { t } = useTranslation()
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [userName, setUserName] = useState(null)
  const [adminInfo, setAdminInfo] = useState({ visa: '-', alienReg: '-', nextDue: '-' })

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setUserName(user.name)
        setAdminInfo({
          visa: formatVisaType(user.visaType),
          alienReg: user.hasAlienRegistration ? t('home.done') : t('home.pending'),
          nextDue: formatDate(user.stayExpirationDate),
        })
      })
      .catch((error) => console.error('[Home] 내 정보 조회 실패', error))
  }, [t])

  const toggleChecked = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="p-4 pt-14">
      <div className="relative rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-200 via-accent-100 to-background-100 p-5">
        <div className="absolute -top-10 left-4 h-28 w-28 animate-float">
          <div className="absolute left-0 top-[5px] h-28 w-28 rounded-full bg-gradient-to-br from-accent-200 to-accent-100" />
          <img src={birdLogo} alt="" className="absolute left-[4px] top-[9px] h-[103px] w-[103px] object-contain" />
        </div>
        <div className="mb-3 flex items-center justify-between pl-32">
          <p className="text-xs font-semibold tracking-wide text-foreground-700">{t('home.adminInfo')}</p>
          <Link to="/details" className="text-xs font-semibold text-primary-600">
            {t('home.seeAll')}
          </Link>
        </div>
        <div className="relative mb-4 mt-[50px] rounded-xl bg-white p-3 text-sm font-semibold text-foreground-800">
          <span className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 rounded-sm bg-white" />
          {t('home.greeting', { name: userName ?? t('home.greetingFallback') })}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-semibold text-foreground-600">{t('home.visa')}</p>
            <p className="text-sm font-semibold text-primary-600">{adminInfo.visa}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-semibold text-foreground-600">{t('home.alienReg')}</p>
            <p className="text-sm font-semibold text-primary-600">{adminInfo.alienReg}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-semibold text-foreground-600">{t('home.nextDue')}</p>
            <p className="text-sm font-semibold text-primary-600">{adminInfo.nextDue}</p>
          </div>
        </div>
      </div>

      <Link
        to="/simulation"
        className="mt-4 flex items-center gap-4 rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-100 to-background-100 p-4 transition-colors hover:from-accent-200 hover:to-accent-100"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white">
          <CalculatorIcon />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground-900">{t('home.simulatorTitle')}</p>
          <p className="text-xs font-semibold text-foreground-600">{t('home.simulatorDescription')}</p>
        </div>
        <span className="text-foreground-400">›</span>
      </Link>

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-foreground-500">{t('home.commonChecklist')}</p>
      <div className="space-y-3">
        {COMMON_CHECKLIST.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={checkedIds.has(item.id)}
            onToggle={() => toggleChecked(item.id)}
          />
        ))}
      </div>

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-foreground-500">{t('home.myChecklist')}</p>
      <div className="space-y-3">
        {MY_CHECKLIST.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={checkedIds.has(item.id)}
            onToggle={() => toggleChecked(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default Home