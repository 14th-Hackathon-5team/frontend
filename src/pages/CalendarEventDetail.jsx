import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEventDetail } from '../lib/calendarApi'

const CATEGORY_LABEL = {
  VISA: 'Visa',
  TOPIK: 'TOPIK',
  LEGAL: 'Legal',
  ACADEMIC: 'Academic',
}

// 일정 상세 화면 — GuideDetail.jsx와 같은 톤(하단 탭 없이 단독 화면). GET /api/calendar/events/{eventId} 연동.
function CalendarEventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getEventDetail(eventId)
      .then((response) => setEvent(response.data.data))
      .catch((error) => {
        console.error('[CalendarEventDetail] 일정 상세 조회 실패', error)
        setNotFound(true)
      })
  }, [eventId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-background-50 p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">일정을 찾을 수 없습니다.</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background-50 p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-50 pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{event.title}</h1>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent-200 to-accent-100 p-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            {CATEGORY_LABEL[event.category] ?? event.category}
          </span>
          {event.isGlobal && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground-700">
              Common
            </span>
          )}
          <h2 className="mt-3 text-xl font-bold text-foreground-950">{event.title}</h2>
          <p className="mt-2 text-sm text-foreground-700">
            {event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}
          </p>
        </div>

        {event.description && (
          <p className="mt-6 text-sm leading-relaxed text-foreground-800">{event.description}</p>
        )}

        {event.relatedLink && (
          <a
            href={event.relatedLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white"
          >
            Related Link
          </a>
        )}
      </div>
    </div>
  )
}

export default CalendarEventDetail
