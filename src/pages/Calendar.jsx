import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMonthlyEvents } from '../lib/calendarApi'

// 카테고리(VISA/TOPIK_APPLICATION/TOPIK_EXAM/LEGAL/ACADEMIC)만으로 색을 정하면 같은 카테고리 안의
// 서로 다른 일정(예: TOPIK 108회 PBT vs 109회 PBT vs 16회 IBT)이 같은 색으로 겹쳐 보여서 혼동됨.
// 제목 해시 방식은 우연히 같은 색이 나오면(해시 충돌) 날짜가 가까운 일정끼리 겹칠 수 있어서 폐기.
// "이번 달 일정을 날짜순 정렬 후 인덱스로 순환 배정"하는 방식도 폐기 — 달이 바뀔 때마다 인덱스가
// 0부터 다시 시작해서, 예를 들어 8월 마지막 일정과 9월 첫 일정처럼 날짜상 바로 붙어있는 일정이
// 서로 다른 달에서 각각 계산되다 보니 우연히 같은 색을 받는 문제가 있었음(실사용에서 확인됨).
// 지금은 eventId 기준 고정 색 — 어떤 달을 보고 있든 같은 일정은 항상 같은 색이고,
// eventId가 순차 발급되는 한 인접한 일정끼리도 대부분 다른 색이 나옴.
// 빨주노초파남보 — 채도 높은 색만 써서 팔레트 안에서 서로 비슷한 색끼리(예전엔 회색 계열 3개가
// 다 비슷해 보였음) 헷갈리는 일이 없게 함.
const EVENT_COLOR_PALETTE = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-600',
  'bg-green-500',
  'bg-blue-500',
  'bg-indigo-600',
  'bg-purple-500',
]

function eventColor(event) {
  // eventId === -1인 가상 일정(체류기간 만료 D-30 안내)도 안전하게 처리.
  return EVENT_COLOR_PALETTE[Math.abs(event.eventId) % EVENT_COLOR_PALETTE.length]
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

function ChevronIcon({ direction }) {
  const d = direction === 'left' ? 'M12.5 15l-5-5 5-5' : 'M7.5 15l5-5-5-5'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label={t('calendar.prevMonth')}
          className="flex h-11 w-11 items-center justify-center text-foreground-600"
        >
          <ChevronIcon direction="left" />
        </button>
        <p className="w-32 text-center text-lg font-bold text-foreground-950">
          {t('calendar.monthLabel', { month: months[month], year })}
        </p>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label={t('calendar.nextMonth')}
          className="flex h-11 w-11 items-center justify-center text-foreground-600"
        >
          <ChevronIcon direction="right" />
        </button>
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
