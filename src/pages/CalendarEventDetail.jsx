import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getEventDetail } from '../lib/calendarApi'
import { parseGuideContent } from '../lib/parseGuideContent'
import { getCalendarEventContentOverride } from '../lib/calendarEventContent'
import { InfoSummary, InfoImportant, InfoSteps, InfoCaution } from '../components/InfoSections'

// 일정 상세 화면 — GuideDetail.jsx와 같은 톤(하단 탭 없이 단독 화면). GET /api/calendar/events/{eventId} 연동.
// description이 태그 구조로 오면(가이드와 동일한 [SUMMARY]/[STEP] 규칙) 섹션별 UI로, 아니면(지금은 전부
// 이 상태) calendarEventContent.js의 카테고리별 override로, 그마저 없으면 평문으로 대체.
function CalendarEventDetail() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const parsed = useMemo(() => {
    if (!event) return null
    const override = parseGuideContent(getCalendarEventContentOverride(event.category, locale))
    if (locale !== 'ko' && override) return override
    return parseGuideContent(event.description) ?? override
  }, [event, locale])

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
      <div className="min-h-screen p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">{t('calendarDetail.notFound')}</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-400">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{event.title}</h1>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent-200 to-accent-100 p-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            {t(`enums.eventCategory.${event.category}`, { defaultValue: event.category })}
          </span>
          {event.isGlobal && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground-700">
              {t('calendarDetail.common')}
            </span>
          )}
          <h2 className="mt-3 text-xl font-bold text-foreground-950">{event.title}</h2>
          <p className="mt-2 text-sm text-foreground-700">
            {!event.endDate || event.startDate === event.endDate
              ? event.startDate
              : `${event.startDate} ~ ${event.endDate}`}
          </p>
        </div>

        {parsed ? (
          <div className="mt-6 space-y-4">
            {parsed.summary && <InfoSummary title={t('guideDetail.summaryTitle')} text={parsed.summary} />}
            {parsed.important && <InfoImportant title={t('guideDetail.importantTitle')} text={parsed.important} />}
            {parsed.steps.length > 0 && <InfoSteps title={t('guideDetail.stepsTitle')} steps={parsed.steps} />}
            {parsed.caution && <InfoCaution title={t('guideDetail.cautionTitle')} text={parsed.caution} />}
          </div>
        ) : (
          event.description && <p className="mt-6 text-sm leading-relaxed text-foreground-800">{event.description}</p>
        )}

          {event.relatedLink && (
          <a href={event.relatedLink} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white">
            {t('calendarDetail.relatedLink')}
          </a>
        )}
      </div>
    </div>
  )
}

export default CalendarEventDetail