import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import birdLogo from '../assets/bird_logo.png'
import calendarIcon from '../assets/calendar_icon.png'
import { getMyInfo } from '../lib/authApi'
import { getUpcomingEvents, toggleEventCompleted } from '../lib/calendarApi'

// 체크리스트 전용 API는 없음(스웨거 확인 완료). GET /api/calendar/events/upcoming(7일 이내 임박 일정)를
// 하나의 목록으로 보여주고, isGlobal인 항목만 "공통" 배지로 구분함 — docs/backend-notes-2026-08-13.md 참고.
// 완료 체크는 PATCH /api/calendar/events/{eventId}/complete로 서버에 저장되며, 완료된 항목은 목록 아래
// 별도 섹션으로 옮겨서 보여줌. 항목 클릭 시 해당 일정 상세(CalendarEventDetail)로 이동.
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
    isGlobal: event.isGlobal,
    completed: event.completed,
    dueDate: !event.endDate || event.startDate === event.endDate
      ? event.startDate
      : `${event.startDate} ~ ${event.endDate}`,
    badge: diff >= 0 && diff <= 3 ? (diff === 0 ? 'D-day' : `D-${diff}`) : null,
  }
}

function formatVisaType(t, visaType) {
  if (!visaType) return '-'
  return t(`enums.visaType.${visaType}`, { defaultValue: visaType })
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const [year, month, day] = dateString.split('-')
  return `${year}.${month}.${day}`
}

function formatDaysLeft(t, dateString) {
  if (!dateString) return null
  const diff = daysUntil(dateString)
  if (diff > 0) return t('home.daysLeft', { days: diff })
  if (diff === 0) return t('home.dDay')
  return t('home.expired')
}

function formatStayStatus(t, dateString) {
  if (!dateString) return '-'
  return daysUntil(dateString) >= 0 ? t('home.stayStatusValid') : t('home.stayStatusExpired')
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
      className={`glass-surface flex items-center gap-3 rounded-2xl p-4 transition-transform ${
        isNavigable ? 'cursor-pointer active:scale-[0.98]' : ''
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
          {checked && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M3 8.5L6.5 12L13 4" />
            </svg>
          )}
        </span>
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-semibold ${checked ? 'text-foreground-400 line-through' : 'text-foreground-900'}`}>
            {item.title}
          </p>
          {item.isGlobal && (
            <span className="rounded-full bg-background-200 px-1.5 py-0.5 text-[10px] font-semibold text-foreground-600">
              {t('home.common')}
            </span>
          )}
        </div>
        <p className="text-xs font-normal text-foreground-500">{t('home.due', { date: item.dueDate })}</p>
      </div>
      {item.badge && (
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-500">
          {item.badge}
        </span>
      )}
      {isNavigable && <span className="text-foreground-400 text-3xl">›</span>}
    </div>
  )
}

// 메인(홈) 화면 — 최종 디자인(tqwhyl.readdy.co/home) 반영.
function Home() {
  const { t } = useTranslation()
  const [userName, setUserName] = useState(null)
  const [adminInfo, setAdminInfo] = useState({ visa: '-', alienReg: '-', nextDue: '-', daysLeft: null, daysLeftRaw: null, stayStatus: '-' })
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setUserName(user.name)
        setAdminInfo({
          visa: formatVisaType(t, user.visaType),
          alienReg: user.hasAlienRegistration ? t('home.done') : t('home.pending'),
          nextDue: formatDate(user.stayExpirationDate),
          daysLeft: formatDaysLeft(t, user.stayExpirationDate),
          daysLeftRaw: user.stayExpirationDate ? daysUntil(user.stayExpirationDate) : null,
          stayStatus: formatStayStatus(t, user.stayExpirationDate),
        })
      })
      .catch((error) => console.error('[Home] 내 정보 조회 실패', error))
  }, [t])

  useEffect(() => {
    getUpcomingEvents()
      .then((response) => {
        const events = response.data.data
        setChecklist(events.map(toChecklistItem))
      })
      .catch((error) => console.error('[Home] 임박 일정 조회 실패', error))
  }, [])

  // 완료 체크는 서버에 저장됨(PATCH /complete) — 낙관적으로 먼저 화면을 바꾸고,
  // 실패하면 되돌린다.
  const toggleChecked = (id) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    toggleEventCompleted(id).catch((error) => {
      console.error('[Home] 완료 체크 실패', error)
      setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    })
  }

  const incompleteChecklist = checklist.filter((item) => !item.completed)
  const completedChecklist = checklist.filter((item) => item.completed)

  return (
    <div className="p-4 pt-14">
      <div className="mb-4 flex items-center gap-3">
        <img src={birdLogo} alt="" className="h-[53px] w-[53px] shrink-0 rounded-full bg-gradient-to-br from-accent-200 to-accent-100 object-contain" />
        <div>
          <p className="text-base font-bold text-foreground-950">
            {t('home.greeting', { name: userName ?? t('home.greetingFallback') })}
          </p>
          <p className="mt-1 text-[11px] font-normal text-foreground-600">{t('home.subtitle')}</p>
        </div>
      </div>

      <div className="glass-surface-accent rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-black">{t('home.nextStayPeriod')}</p>
            <p className="mt-1 text-3xl font-extrabold text-foreground-950">{adminInfo.nextDue}</p>
            {adminInfo.daysLeft && (
              <span
                className={`mt-2 inline-flex items-center gap-1 text-[13px] font-semibold ${
                  adminInfo.daysLeftRaw !== null && adminInfo.daysLeftRaw < 0 ? 'text-red-500' : 'text-foreground-600'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                {adminInfo.daysLeft}
              </span>
            )}
          </div>
          <img src={calendarIcon} alt="" className="h-[102px] w-[102px] shrink-0 object-contain" />
        </div>

        <div className="mt-4 flex items-stretch justify-center gap-[26px] border-t border-background-300 pt-4">
          <div className="text-left">
            <p className="text-[11px] font-semibold text-foreground-600">{t('home.visa')}</p>
            <p className="text-[13px] font-extrabold text-black">{adminInfo.visa}</p>
          </div>
          <div className="w-px shrink-0 bg-background-300" />
          <div className="text-left">
            <p className="text-[11px] font-semibold text-foreground-600">{t('home.alienReg')}</p>
            <p className="text-[13px] font-extrabold text-[#B8860B]">{adminInfo.alienReg}</p>
          </div>
          <div className="w-px shrink-0 bg-background-300" />
          <div className="text-left">
            <p className="text-[11px] font-semibold text-foreground-600">{t('home.stayStatus')}</p>
            <p className="text-[13px] font-extrabold text-black">{adminInfo.stayStatus}</p>
          </div>
        </div>
      </div>

      <Link
        to="/simulation"
        className="glass-surface mt-4 flex items-center gap-4 rounded-2xl p-4 transition-transform active:scale-[0.98]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF6DC] text-black">
          <CalculatorIcon />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground-900">{t('home.simulatorTitle')}</p>
          <p className="text-xs font-normal text-foreground-600">{t('home.simulatorDescription')}</p>
        </div>
        <span className="text-foreground-400 text-3xl">›</span>
      </Link>

      <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-foreground-500">{t('home.checklist')}</p>
      <div className="space-y-3">
        {checklist.length === 0 && <p className="text-sm text-foreground-400">{t('home.noUpcoming')}</p>}
        {incompleteChecklist.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={item.completed}
            onToggle={() => toggleChecked(item.id)}
          />
        ))}
      </div>

      {completedChecklist.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-xs font-semibold tracking-wide text-foreground-500">{t('home.completedChecklist')}</p>
          <div className="space-y-3">
            {completedChecklist.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                checked={item.completed}
                onToggle={() => toggleChecked(item.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Home