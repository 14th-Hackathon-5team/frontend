import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import birdLogo from '../assets/bird_logo.png'
import calendarIcon from '../assets/calendar_icon.png'
import { getMyInfo } from '../lib/authApi'
import { getMonthlyEvents, toggleEventCompleted } from '../lib/calendarApi'

// 체크리스트 전용 API는 없음(스웨거 확인 완료). GET /api/calendar/events/upcoming는 7일 이내로 고정돼 있어서
// (백엔드에 기간 파라미터 없음) 대신 월별 조회(GET /api/calendar/events?year=&month=)를 오늘부터 30일 뒤까지
// 걸치는 달만큼 호출해서 프론트에서 "오늘부터 30일 이내" + "아직 끝나지 않은" 일정만 걸러 보여줌.
// isGlobal인 항목만 "공통" 배지로 구분함 — docs/backend-notes-2026-08-13.md 참고.
// 완료 체크는 PATCH /api/calendar/events/{eventId}/complete로 서버에 저장되며, 완료된 항목은 목록 아래
// 별도 섹션으로 옮겨서 보여줌. 항목 클릭 시 해당 일정 상세(CalendarEventDetail)로 이동.
const CHECKLIST_WINDOW_DAYS = 30

function daysUntil(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

// today~today+windowDays에 걸치는 연/월 목록(최대 2개월). 월별 조회 API를 몇 번 호출해야 하는지 계산.
function monthsInWindow(windowDays) {
  const today = new Date()
  const rangeEnd = new Date(today)
  rangeEnd.setDate(rangeEnd.getDate() + windowDays)

  const months = []
  const cursor = new Date(today.getFullYear(), today.getMonth(), 1)
  const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1)
  while (cursor <= last) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

// 아직 끝나지 않았고(오늘 이후 종료), windowDays 이내에 시작하는 일정만 남김 — 이미 끝난 일정은 제외.
// 체류기간 만료(eventId=-2)는 예외 — 지난 뒤가 오히려 더 급한 문제(불법체류)라 종료 여부와 무관하게 보여준다.
function isWithinChecklistWindow(event, windowDays) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rangeEnd = new Date(today)
  rangeEnd.setDate(rangeEnd.getDate() + windowDays)

  const start = new Date(event.startDate)
  if (event.eventId === -2) return start <= rangeEnd

  const end = new Date(event.endDate || event.startDate)
  return end >= today && start <= rangeEnd
}

// 아직 시작 전이면 시작일까지, 이미 시작해서 진행 중(startDate~endDate 사이)이면 종료일까지 D-day를 센다.
// 체류기간 만료(eventId=-2)가 이미 지났으면 배지/문구를 경고 톤으로 바꾼다.
function toChecklistItem(t, event) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(event.startDate)
  const end = new Date(event.endDate || event.startDate)
  const target = today < start ? start : end
  const diff = Math.round((target - today) / 86400000)
  const overdue = event.eventId === -2 && diff < 0
  return {
    id: event.eventId,
    eventId: event.eventId,
    title: event.title,
    isGlobal: event.isGlobal,
    completed: event.completed,
    dueDate: !event.endDate || event.startDate === event.endDate
      ? event.startDate
      : `${event.startDate} ~ ${event.endDate}`,
    dueLabel: overdue ? t('home.stayExpirationOverdueNotice') : undefined,
    badge: overdue ? t('home.expired') : diff === 0 ? 'D-day' : `D-${diff}`,
    badgeUrgent: overdue || diff <= 3,
  }
}

function formatVisaType(t, visaType) {
  if (!visaType) return '-'
  return t(`enums.visaType.${visaType}`, { defaultValue: visaType })
}

function formatTopikLevel(t, topikLevel) {
  if (!topikLevel) return '-'
  return t(`enums.topikLevel.${topikLevel}`, { defaultValue: topikLevel })
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
  // eventId가 음수면 실제 저장된 일정이 아니라 백엔드가 조회 시점에 계산해서 내려주는 가상 일정
  // (체류기간 만료 D-30 안내: eventId=-1, 체류기간 만료 당일: eventId=-2) — 상세 조회도 정상 지원함
  // (2026-08-20 재확인: GET /api/calendar/events/-1, -2 모두 200. CalendarEventDetail.jsx가
  // calendarEventContent.js의 VISA override로 상세 내용을 채워서 보여준다.
  const handleRowClick = () => {
    navigate(`/calendar/${item.eventId}`)
  }

  return (
    <div onClick={handleRowClick} className="glass-surface flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-transform active:scale-[0.98]">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        aria-pressed={checked}
        className="flex h-9 w-9 shrink-0 items-center justify-center"
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
          {item.badge && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                item.badgeUrgent ? 'bg-accent-100 text-accent-500' : 'bg-[#FDF6DC] text-foreground-700'
              }`}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-xs font-normal text-foreground-500">{item.dueLabel ?? t('home.due', { date: item.dueDate })}</p>
      </div>
      <span className="text-foreground-400 text-3xl">›</span>
    </div>
  )
}

// 메인(홈) 화면 — 최종 디자인(tqwhyl.readdy.co/home) 반영.
function Home() {
  const { t } = useTranslation()
  const [userName, setUserName] = useState(null)
  const [adminInfo, setAdminInfo] = useState({
    visa: '-',
    topik: '-',
    nextDue: '-',
    daysLeft: null,
    daysLeftRaw: null,
    stayStatus: '-',
  })
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setUserName(user.name)
        setAdminInfo({
          visa: formatVisaType(t, user.visaType),
          topik: formatTopikLevel(t, user.currentTopikLevel),
          nextDue: formatDate(user.stayExpirationDate),
          daysLeft: formatDaysLeft(t, user.stayExpirationDate),
          daysLeftRaw: user.stayExpirationDate ? daysUntil(user.stayExpirationDate) : null,
          stayStatus: formatStayStatus(t, user.stayExpirationDate),
        })
      })
      .catch((error) => console.error('[Home] 내 정보 조회 실패', error))
  }, [t])

  useEffect(() => {
    const months = monthsInWindow(CHECKLIST_WINDOW_DAYS)
    Promise.all(months.map(({ year, month }) => getMonthlyEvents(year, month)))
      .then((responses) => {
        const seen = new Set()
        const events = []
        responses.forEach((response) => {
          response.data.data.forEach((event) => {
            const key = `${event.eventId}-${event.startDate}`
            if (seen.has(key) || !isWithinChecklistWindow(event, CHECKLIST_WINDOW_DAYS)) return
            seen.add(key)
            events.push(event)
          })
        })
        events.sort((a, b) => a.startDate.localeCompare(b.startDate))
        setChecklist(events.map((event) => toChecklistItem(t, event)))
      })
      .catch((error) => console.error('[Home] 다가오는 일정 조회 실패', error))
  }, [t])

  // 완료 체크는 서버에 저장됨(PATCH /complete) — 낙관적으로 먼저 화면을 바꾸고, 실패하면 되돌린다.
  // 체류기간 만료 관련 가상 일정(eventId=-1, -2)도 백엔드가 완료 상태를 저장해주므로 동일하게 처리한다.
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
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={birdLogo} alt="" className="h-[53px] w-[53px] shrink-0 rounded-full bg-gradient-to-br from-accent-200 to-accent-100 object-contain" />
          <div>
            <p className="text-base font-bold text-foreground-950">
              {t('home.greeting', { name: userName ?? t('home.greetingFallback') })}
            </p>
            <p className="mt-1 text-[11px] font-normal text-foreground-600">{t('home.subtitle')}</p>
          </div>
        </div>
        <Link
          to="/settings/edit-profile"
          className="glass-surface mt-[26px] flex shrink-0 items-center gap-1 whitespace-nowrap rounded-2xl px-[10px] py-[6px] text-[10px] font-semibold text-foreground-900 transition-transform active:scale-[0.98]"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          {t('home.editInfo')}
        </Link>
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
            <p className="text-[11px] font-semibold text-foreground-600">{t('home.topik')}</p>
            <p className="text-[13px] font-extrabold text-black">{adminInfo.topik}</p>
          </div>
          <div className="w-px shrink-0 bg-background-300" />
          <div className="text-left">
            <p className="text-[11px] font-semibold text-foreground-600">{t('home.stayStatus')}</p>
            <p className="text-[13px] font-extrabold text-[#B8860B]">{adminInfo.stayStatus}</p>
          </div>
        </div>
      </div>

      {/* 생활비 계산기 임시 비활성화 — 화면에서 숨김. 다시 켜려면 아래 주석을 해제.
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
      */}

      <div className="mb-2 mt-6">
        <p className="text-[18px] font-semibold tracking-wide text-black">{t('home.checklist')}</p>
        <p className="mt-1 text-[11px] text-foreground-400">{t('home.checklistSubtitle')}</p>
      </div>
      <div className="space-y-2">
        {incompleteChecklist.length === 0 && (
          <p className="text-sm text-foreground-400">
            {checklist.length === 0 ? t('home.noUpcoming') : t('home.allDone')}
          </p>
        )}
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
          <div className="space-y-2">
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