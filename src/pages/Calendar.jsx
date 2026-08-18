import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMonthlyEvents } from '../lib/calendarApi'

// 카테고리(VISA/TOPIK_APPLICATION/TOPIK_EXAM/LEGAL/ACADEMIC)만으로 색을 정하면 같은 카테고리 안의
// 서로 다른 일정(예: TOPIK 108회 PBT vs 109회 PBT vs 16회 IBT)이 같은 색으로 겹쳐 보여서 혼동됨.
// 그래서 카테고리 대신 일정 제목 기준으로 색을 순환 배정 — 같은 제목이면 항상 같은 색, 다른 제목이면 다른 색.
const EVENT_COLOR_PALETTE = [
  'bg-primary-500',
  'bg-accent-500',
  'bg-foreground-700',
  'bg-accent-400',
  'bg-primary-300',
  'bg-foreground-500',
]

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function eventColor(event) {
  return EVENT_COLOR_PALETTE[hashString(event.title ?? '') % EVENT_COLOR_PALETTE.length]
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDate = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()

  const cells = []
  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  for (let date = 1; date <= lastDate; date += 1) cells.push(date)
  return cells
}

// startDate/endDate(YYYY-MM-DD)를 현재 보고 있는 달의 day 범위(1~마지막 날)로 잘라서 반환.
function toDayRange(event, year, month) {
  const lastDate = new Date(year, month + 1, 0).getDate()
  const start = new Date(event.startDate)
  // endDate는 하루짜리 일정(시험일 등)이면 null로 내려옴 — 이 경우 시작일과 동일하게 취급.
  const end = new Date(event.endDate || event.startDate)
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month, lastDate)

  const clampedStart = start < monthStart ? monthStart : start
  const clampedEnd = end > monthEnd ? monthEnd : end

  return { day: clampedStart.getDate(), endDay: clampedEnd.getDate() }
}

function eventOnDay(events, date) {
  return events.find((event) => date >= event.day && date <= event.endDay)
}

function formatRange(event) {
  return !event.endDate || event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate} ~ ${event.endDate}`
}

// 캘린더 화면 — 최종 디자인(tqwhyl.readdy.co/calendar) 반영. 일정은 GET /api/calendar/events 연동.
function Calendar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const weekdays = t('calendar.weekdays', { returnObjects: true })
  const months = t('calendar.months', { returnObjects: true })
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  useEffect(() => {
    setLoading(true)
    setErrorMessage(null)
    getMonthlyEvents(year, month + 1)
      .then((response) => {
        const withDayRange = response.data.data.map((event) => ({
          ...event,
          ...toDayRange(event, year, month),
        }))
        setEvents(withDayRange)
      })
      .catch((error) => {
        console.error('[Calendar] 일정 조회 실패', error)
        setErrorMessage(t('calendar.loadError'))
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [year, month, t])

  return (
    <div className="p-4">
      <h1 className="mb-4 text-center text-lg font-semibold text-foreground-950">{t('calendar.title', { year })}</h1>

      <div className="mb-4 flex justify-start gap-2">
        <select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="rounded-xl border-2 border-background-200 bg-white px-3 py-2 text-sm font-semibold text-foreground-900"
        >
          {months.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="rounded-xl border-2 border-background-200 bg-white px-3 py-2 text-sm font-semibold text-foreground-900"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {weekdays.map((day) => (
          <div key={day} className="font-semibold text-foreground-400">
            {day}
          </div>
        ))}
        {cells.map((date, index) => {
          const event = date ? eventOnDay(events, date) : null
          const isRange = event && event.day !== event.endDay
          const isStart = event && date === event.day
          const isEnd = event && date === event.endDay

          let roundedClass = 'rounded-xl'
          if (isRange) {
            if (isStart && !isEnd) roundedClass = 'rounded-l-xl rounded-r-none'
            else if (isEnd && !isStart) roundedClass = 'rounded-r-xl rounded-l-none'
            else if (!isStart && !isEnd) roundedClass = 'rounded-none'
          }

          return (
            <div key={index} className="flex h-9 items-center justify-center">
              {date && (
                <span
                  className={`flex h-8 items-center justify-center text-sm ${roundedClass} ${
                    isRange ? 'w-full' : 'w-8'
                  } ${event ? `${eventColor(event)} font-semibold text-white` : 'font-semibold text-foreground-800'}`}
                >
                  {date}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-foreground-900">
        {t('calendar.monthLabel', { month: months[month], year })}
      </p>
      {loading && <p className="py-4 text-center text-sm text-foreground-400">{t('common.loading')}</p>}
      {errorMessage && <p className="py-4 text-center text-sm text-red-500">{errorMessage}</p>}
      {!loading && !errorMessage && events.length === 0 && (
        <p className="py-4 text-center text-sm text-foreground-400">{t('calendar.noEvents')}</p>
      )}
      <ul className="divide-y divide-background-200">
        {events.map((event) => {
          // eventId === -1은 실제 저장된 일정이 아니라 조회 시점에 계산해서 끼워 넣는 가상 일정
          // (예: 체류기간 만료 D-30 안내) — 상세 조회 API가 404를 내므로 상세 화면으로 이동시키지 않음.
          const isNavigable = event.eventId !== -1
          return (
            <li key={event.eventId === -1 ? 'stay-expiration-alert' : event.eventId}>
              <button
                type="button"
                onClick={() => isNavigable && navigate(`/calendar/${event.eventId}`)}
                className={`flex w-full items-center gap-2 py-3 text-left transition-colors ${
                  isNavigable ? 'hover:bg-primary-50' : 'cursor-default'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${eventColor(event)}`} />
                <span className="flex-1 text-sm font-semibold text-foreground-900">{event.title}</span>
                <span className="text-sm font-semibold text-foreground-500">{formatRange(event)}</span>
                {isNavigable && <span className="text-foreground-400">›</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Calendar
