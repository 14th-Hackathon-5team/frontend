import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import birdLogo from '../assets/bird_logo.png'
import { getMyInfo } from '../lib/authApi'
import { getUpcomingEvents } from '../lib/calendarApi'

// 체크리스트 전용 API는 없음(스웨거 확인 완료). 대신 GET /api/calendar/events/upcoming(7일 이내 임박 일정)를
// isGlobal 기준으로 공통/개인으로 나눠서 체크리스트처럼 보여줌 — docs/backend-notes-2026-08-13.md 참고.
// 항목 클릭 시 해당 일정 상세(CalendarEventDetail)로 이동. 체크 상태는 저장되지 않고 새로고침하면 초기화됨(기존 더미 데이터도 동일했음).
function daysUntil(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

function toChecklistItem(event) {
  const diff = daysUntil(event.startDate)
  return {
    id: event.eventId,
    eventId: event.eventId,
    title: event.title,
    dueDate: event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`,
    badge: diff >= 0 && diff <= 3 ? (diff === 0 ? 'D-day' : `D-${diff}`) : null,
  }
}

function formatVisaType(t, visaType) {
  if (!visaType) return '-'
  return t(`enums.visaType.${visaType}`, { defaultValue: visaType })
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
  // eventId === -1은 실제 저장된 일정이 아니라 조회 시점에 계산해서 끼워 넣는 가상 일정(예: 체류기간 만료 D-30 안내)
  // — 상세 조회 API가 404를 내므로 상세 화면으로 이동시키지 않음.
  const isNavigable = item.eventId !== -1

  const handleRowClick = () => {
    if (!isNavigable) return
    navigate(`/calendar/${item.eventId}`)
  }

  return (
    <div
      onClick={handleRowClick}
      className={`glass-surface flex items-center gap-3 rounded-2xl p-4 transition-colors ${
        isNavigable ? 'cursor-pointer hover:border-primary-300 hover:bg-primary-50' : ''
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        aria-pressed={checked}
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
            checked ? 'border-primary-500 bg-primary-500 text-white' : 'border-background-300 hover:border-primary-400 hover:bg-primary-100'
          }`}
        >
          {checked && '✓'}
        </span>
      </button>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${checked ? 'text-foreground-400 line-through' : 'text-foreground-900'}`}>
          {item.title}
        </p>
        <p className="text-xs font-semibold text-foreground-500">{t('home.due', { date: item.dueDate })}</p>
      </div>
      {item.badge && (
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-500">
          {item.badge}
        </span>
      )}
      {isNavigable && <span className="text-foreground-400">›</span>}
    </div>
  )
}

// 메인(홈) 화면 — 최종 디자인(tqwhyl.readdy.co/home) 반영.
function Home() {
  const { t } = useTranslation()
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [userName, setUserName] = useState(null)
  const [adminInfo, setAdminInfo] = useState({ visa: '-', alienReg: '-', nextDue: '-' })
  const [commonChecklist, setCommonChecklist] = useState([])
  const [myChecklist, setMyChecklist] = useState([])

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setUserName(user.name)
        setAdminInfo({
          visa: formatVisaType(t, user.visaType),
          alienReg: user.hasAlienRegistration ? t('home.done') : t('home.pending'),
          nextDue: formatDate(user.stayExpirationDate),
        })
      })
      .catch((error) => console.error('[Home] 내 정보 조회 실패', error))
  }, [t])

  useEffect(() => {
    getUpcomingEvents()
      .then((response) => {
        const events = response.data.data
        setCommonChecklist(events.filter((event) => event.isGlobal).map(toChecklistItem))
        setMyChecklist(events.filter((event) => !event.isGlobal).map(toChecklistItem))
      })
      .catch((error) => console.error('[Home] 임박 일정 조회 실패', error))
  }, [])

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
      <div className="glass-surface-accent relative rounded-2xl p-5">
        <div className="absolute -top-10 left-4 h-28 w-28 animate-float">
          <div className="absolute left-0 top-[5px] h-28 w-28 rounded-full bg-gradient-to-br from-accent-200 to-accent-100" />
          <img src={birdLogo} alt="" className="absolute left-[4px] top-[9px] h-[103px] w-[103px] object-contain" />
        </div>
        <div className="mb-3 pl-32">
          <p className="text-sm font-semibold tracking-wide text-foreground-700">{t('home.adminInfo')}</p>
        </div>
        <div className="glass-surface relative mb-4 mt-[50px] rounded-xl p-3 text-sm font-semibold text-foreground-800">
          <span className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 rounded-sm bg-white/70" />
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
        className="glass-surface-accent mt-4 flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:brightness-105"
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
        {commonChecklist.length === 0 && <p className="text-sm text-foreground-400">{t('home.noUpcoming')}</p>}
        {commonChecklist.map((item) => (
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
        {myChecklist.length === 0 && <p className="text-sm text-foreground-400">{t('home.noUpcoming')}</p>}
        {myChecklist.map((item) => (
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