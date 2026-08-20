import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMonthlyEvents } from '../lib/calendarApi'
import { translateEventTitle } from '../lib/calendarEventTitle'

// 카테고리(VISA/TOPIK_APPLICATION/TOPIK_EXAM/LEGAL/ACADEMIC)만으로 색을 정하면 같은 카테고리 안의
// 서로 다른 일정(예: TOPIK 108회 PBT vs 109회 PBT vs 16회 IBT)이 같은 색으로 겹쳐 보여서 혼동됨.
// 제목 해시 방식은 우연히 같은 색이 나오면(해시 충돌) 날짜가 가까운 일정끼리 겹칠 수 있어서 폐기.
// "이번 달 일정을 날짜순 정렬 후 인덱스로 순환 배정"하는 방식도 폐기 — 달이 바뀔 때마다 인덱스가
// 0부터 다시 시작해서, 예를 들어 8월 마지막 일정과 9월 첫 일정처럼 날짜상 바로 붙어있는 일정이
// 서로 다른 달에서 각각 계산되다 보니 우연히 같은 색을 받는 문제가 있었음(실사용에서 확인됨).
// 지금은 eventId 기준 고정 색 — 어떤 달을 보고 있든 같은 일정은 항상 같은 색이고,
// eventId가 순차 발급되는 한 인접한 일정끼리도 대부분 다른 색이 나옴.
// 코랄→오렌지→옐로우→그린→민트→블루→퍼플 — K-Buddy 톤에 맞춘 따뜻한 파스텔 팔레트(디자인 지정 값).
const EVENT_COLOR_PALETTE = [
  'bg-[#E88B8B]',
  'bg-[#E9A66F]',
  'bg-[#D9BE63]',
  'bg-[#91B89A]',
  'bg-[#79B8B0]',
  'bg-[#7FAFD1]',
  'bg-[#A68FC2]',
]

function eventColor(event) {
  // Math.abs(eventId) % N을 쓰면 eventId가 2인 실제 일정과 -2인 가상 일정(체류기간 만료 등)이
  // 절댓값이 같아서 항상 같은 색으로 충돌한다 — 실사용에서 TOPIK 접수기간(eventId=2)과 체류기간
  // 만료(eventId=-2)가 겹치는 걸로 확인됨. 부호를 보존하는 floored modulo로 교체해 이 충돌을 없앤다.
  const length = EVENT_COLOR_PALETTE.length
  const index = ((event.eventId % length) + length) % length
  return EVENT_COLOR_PALETTE[index]
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

// 하루에 일정이 여러 개 겹치면(예: TOPIK 접수기간과 체류기간 만료) 하나만 find로 골라서 나머지가
// 화면에서 완전히 사라지는 문제가 있었음 — filter로 그날의 일정을 전부 가져와서 전부 표시한다.
function eventsOnDay(events, date) {
  return events.filter((event) => date >= event.day && date <= event.endDay)
}

// 맨 아래(가장 오래된/첫 일정)는 셀 전체를 채우는 배경으로 두고, 그 위로 겹치는 일정은 이 목록에서
// 순서대로 크기를 골라 셀 중앙에 점점 작게 겹쳐 쌓는다(케이크 층처럼). 겹치는 일정 수만큼 자동으로
// 처리되도록 크기값을 미리 배열로 정의해둠 — 4개 이상 겹치면 이후는 가장 작은 크기를 그대로 재사용.
// 모서리 둥글기(rounded-*)도 크기에 비례하게 미리 정해둠 — 8/31 같은 단독 일정(h-10, rounded-xl,
// 반지름/높이 ≈ 0.3)과 같은 비율이 되도록 각 크기별로 계산한 값. 같은 비율값 없이 전부 rounded-lg를
// 쓰면 작은 뱃지일수록 상대적으로 더 둥글어 보여서(반지름은 그대로인데 크기만 작아지니까) 다른
// 일정들과 이질감이 생김.
// h-7/h-4/h-2.5(1.75rem/1rem/0.625rem)에서 10% 키운 값 — Tailwind 기본 스케일에 없어서 임의값으로 지정.
const OVERLAY_SIZES = [
  { badge: 'h-[1.925rem] w-[1.925rem]', badgeRounded: 'rounded-lg', bar: 'h-[1.925rem]', barStart: 'rounded-l-lg rounded-r-none', barEnd: 'rounded-r-lg rounded-l-none', barMid: 'rounded-none' },
  { badge: 'h-[1.4641rem] w-[1.4641rem]', badgeRounded: 'rounded', bar: 'h-[1.4641rem]', barStart: 'rounded-l rounded-r-none', barEnd: 'rounded-r rounded-l-none', barMid: 'rounded-none' },
  { badge: 'h-[0.9150625rem] w-[0.9150625rem]', badgeRounded: 'rounded-sm', bar: 'h-[0.9150625rem]', barStart: 'rounded-l-sm rounded-r-none', barEnd: 'rounded-r-sm rounded-l-none', barMid: 'rounded-none' },
]

function overlaySizeFor(index) {
  return OVERLAY_SIZES[Math.min(index, OVERLAY_SIZES.length - 1)]
}

function overlayBarRoundedClass(size, event, date) {
  const isStart = date === event.day
  const isEnd = date === event.endDay
  if (isStart && !isEnd) return size.barStart
  if (isEnd && !isStart) return size.barEnd
  return size.barMid
}

// 여러 날짜에 걸친 일정(TOPIK 접수기간 등)은 시작일만 왼쪽, 종료일만 오른쪽을 둥글게 해서 그 사이
// 날짜들끼리 이어진 띠처럼 보이게 한다. 겹치는 일정이 있어도 이 로직은 일정별로 독립적으로 적용됨.
function bandRoundedClass(event, date) {
  if (event.day === event.endDay) return 'rounded-xl'
  const isStart = date === event.day
  const isEnd = date === event.endDay
  if (isStart && !isEnd) return 'rounded-l-xl rounded-r-none'
  if (isEnd && !isStart) return 'rounded-r-xl rounded-l-none'
  if (!isStart && !isEnd) return 'rounded-none'
  return 'rounded-xl'
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
  const { t, i18n } = useTranslation()
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
    <div className="p-4 pt-8">
      <div className="glass-surface rounded-2xl p-4">
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
            const dayEvents = date ? eventsOnDay(events, date) : []
            const primaryEvent = dayEvents[0] ?? null
            const overlayEvents = dayEvents.slice(1)
            const isRange = primaryEvent && primaryEvent.day !== primaryEvent.endDay
            const hasRangeOverlay = overlayEvents.some((event) => event.day !== event.endDay)
            const isToday = date === today.getDate() && year === today.getFullYear() && month === today.getMonth()
            // 겹치는 일정이 있어도 전부 하루짜리면 셀 폭을 늘릴 필요가 없음(예: 31일 "체류기간 만료" +
            // 겹친 하루짜리 일정들) — 실제로 여러 날짜에 걸친 일정이 하나라도 있을 때만 폭을 늘려서
            // 그 이어진 막대를 제대로 보여준다.
            const widthClass = isRange || hasRangeOverlay ? 'w-full' : 'w-10'
            const roundedClass = primaryEvent ? bandRoundedClass(primaryEvent, date) : 'rounded-xl'
            const textColorClass = dayEvents.length > 0 ? 'text-white' : 'text-foreground-800'
            const primaryBgClass = primaryEvent ? eventColor(primaryEvent) : ''

            return (
              <div key={index} className="flex h-11 items-center justify-center">
                {date && (
                  <span
                    className={`relative flex h-10 items-center justify-center text-sm font-semibold ${widthClass} ${roundedClass} ${primaryBgClass} ${textColorClass}`}
                  >
                    {/* 맨 아래(배경) 위로 겹치는 일정마다 OVERLAY_SIZES에서 순서대로 크기를 골라 셀 중앙에
                        점점 작게 겹쳐 쌓는다 — 몇 개가 겹치든 같은 로직으로 처리됨. 여러 날짜짜리 일정은
                        날마다 따로 찍힌 도형이 아니라 셀 폭 전체를 채우는 얇은 막대로 이어지게 표시. */}
                    {overlayEvents.map((overlayEvent, overlayIndex) => {
                      const overlayIsRange = overlayEvent.day !== overlayEvent.endDay
                      const size = overlaySizeFor(overlayIndex)
                      return overlayIsRange ? (
                        <span
                          key={overlayEvent.eventId}
                          className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${size.bar} ${eventColor(overlayEvent)} ${overlayBarRoundedClass(size, overlayEvent, date)}`}
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          key={overlayEvent.eventId}
                          className={`absolute inset-0 m-auto ${size.badge} ${size.badgeRounded} ${eventColor(overlayEvent)}`}
                          aria-hidden="true"
                        />
                      )
                    })}
                    <span className={`relative z-10 ${isToday ? 'text-red-500' : ''}`}>{date}</span>
                  </span>
                )}
              </div>
            )
          })}
        </div>
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
        {events.map((event) => (
          <li key={event.eventId}>
            <button
              type="button"
              onClick={() => navigate(`/calendar/${event.eventId}`)}
              className="flex w-full items-center gap-2 py-3 text-left transition-transform active:scale-[0.98]"
            >
              <span className={`h-2 w-2 rounded-full ${eventColor(event)}`} />
              <span className="flex-1 text-sm font-semibold text-foreground-900">{translateEventTitle(event.title, { eventId: event.eventId, locale: i18n.language, t })}</span>
              <span className="text-sm font-semibold text-foreground-500">{formatRange(event)}</span>
              <span className="text-foreground-400">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Calendar
