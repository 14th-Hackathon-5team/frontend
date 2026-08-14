import { useMemo, useState } from 'react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// TODO: 실제 일정 데이터는 캘린더 API 연동 후 대체. 지금은 최종 디자인 예시 데이터 사용.
const CATEGORY_COLOR = {
  legal: 'bg-primary-500',
  health: 'bg-accent-500',
  academic: 'bg-foreground-500',
}
const EVENTS = [
  { id: 1, title: 'Alien Registration', day: 5, endDay: 5, category: 'legal' },
  { id: 2, title: 'Health Checkup', day: 12, endDay: 12, category: 'health' },
  { id: 3, title: 'TOPIK Registration Deadline', day: 18, endDay: 20, category: 'academic' },
  { id: 4, title: 'Midterm Exams', day: 22, endDay: 24, category: 'legal' },
  { id: 5, title: 'Visa Renewal', day: 28, endDay: 28, category: 'health' },
]

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDate = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()

  const cells = []
  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  for (let date = 1; date <= lastDate; date += 1) cells.push(date)
  return cells
}

function eventOnDay(date) {
  return EVENTS.find((event) => date >= event.day && date <= event.endDay)
}

function formatRange(event) {
  return event.day === event.endDay ? `${event.day}` : `${event.day} - ${event.endDay}`
}

// 캘린더 화면 — 최종 디자인(tqwhyl.readdy.co/calendar) 반영.
function Calendar() {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  return (
    <div className="p-4">
      <h1 className="mb-4 text-center text-lg font-semibold text-foreground-950">{year} Calendar</h1>

      <div className="mb-4 flex justify-start gap-2">
        <select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="rounded-xl border border-background-200 bg-white px-3 py-2 text-sm font-semibold text-foreground-900"
        >
          {MONTHS.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="rounded-xl border border-background-200 bg-white px-3 py-2 text-sm font-semibold text-foreground-900"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
        {WEEKDAYS.map((day) => (
          <div key={day} className="font-semibold text-foreground-400">
            {day}
          </div>
        ))}
        {cells.map((date, index) => {
          const event = date ? eventOnDay(date) : null
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
                  } ${event ? `${CATEGORY_COLOR[event.category]} font-semibold text-white` : 'font-semibold text-foreground-800'}`}
                >
                  {date}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-foreground-900">
        {MONTHS[month]}, {year}
      </p>
      <ul className="divide-y divide-background-200">
        {EVENTS.map((event) => (
          <li key={event.id} className="flex items-center gap-2 py-3">
            <span className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[event.category]}`} />
            <span className="flex-1 text-sm font-semibold text-foreground-900">{event.title}</span>
            <span className="text-sm font-semibold text-foreground-500">{formatRange(event)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Calendar
