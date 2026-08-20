import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { markNotificationRead } from '../lib/notificationsApi'
import { daysUntil, detectNotificationType, formatRange, getNotificationDetails } from '../lib/notificationHelpers'
import { InfoSummary, InfoImportant, InfoCaution, InfoTimeline } from '../components/InfoSections'

function Section({ title, children }) {
  return (
    <div className="mt-6 border-t border-background-200 pt-5">
      <p className="text-sm font-semibold text-foreground-700">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground-800">{children}</div>
    </div>
  )
}

// notification.summary(있으면 AI가 매일 프로필 기반으로 새로 쓰는 개인화 요약)는 실제 응답에 있었는데도
// 지금까지 화면에 안 쓰이고 있었음 — 요약 박스로 노출. details.details(대상/상황/조치보다 더 긴 법령
// 보충 설명)도 마찬가지로 방치돼 있어서 타임라인 마지막 줄로 살림. details.trigger는 AI 내부 판단
// 근거(개발자용 문구)라 사용자에게 보여주지 않는다.
function LawDetail({ t, notification }) {
  const details = getNotificationDetails(notification)
  const timelineRows = [
    [t('notificationDetail.law.target'), details.target],
    [t('notificationDetail.law.situation'), details.situation],
    [t('notificationDetail.law.action'), details.action],
    [t('notificationDetail.law.deadline'), details.deadline],
    [t('notificationDetail.law.moreDetail'), details.details],
  ]
  const source = [details.sourceName, [details.lawName, details.article].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
  const cautionText = [
    details.penalty && `${t('notificationDetail.law.penalty')}: ${details.penalty}`,
    source && `${t('notificationDetail.law.source')}: ${source}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <div className="mt-4 space-y-4">
      {notification.summary && <InfoSummary title={t('notificationDetail.law.summaryTitle')} text={notification.summary} />}
      {notification.reason && <InfoImportant title={t('recommend.reasonTitleLaw')} text={notification.reason} />}
      <InfoTimeline title={t('notificationDetail.law.checklistTitle')} rows={timelineRows} />
      {cautionText && <InfoCaution title={t('notificationDetail.law.cautionTitle')} text={cautionText} />}
    </div>
  )
}

function ApplicationDeadlineBadge({ t, range }) {
  if (!range?.end) return null
  const diff = daysUntil(range.end)
  const label = diff < 0 ? t('recommend.applicationClosed') : diff === 0 ? 'D-day' : `D-${diff}`
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${diff < 0 ? 'bg-background-200 text-foreground-500' : 'bg-accent-100 text-accent-500'}`}>
      {label}
    </span>
  )
}

function UniversityDetail({ t, notification }) {
  const details = getNotificationDetails(notification)
  const eligibilityRows = [
    [t('notificationDetail.admission.eligibilityNationality'), details.admission_eligibility?.nationality],
    [t('notificationDetail.admission.eligibilityAcademic'), details.admission_eligibility?.academic],
    [t('notificationDetail.admission.eligibilityLanguage'), details.admission_eligibility?.language],
  ]
  const interview = details.interview?.yn ? `${details.interview.date ?? ''} ${details.interview.type ?? ''}`.trim() : null
  const timelineRows = [
    [t('notificationDetail.admission.applicationSchedule'), formatRange(details.application_schedule)],
    [t('notificationDetail.admission.documentSubmission'), formatRange(details.document_submission_schedule)],
    [t('notificationDetail.admission.documentEvaluation'), formatRange(details.document_evaluation_schedule)],
    [t('notificationDetail.admission.interview'), interview],
    [t('notificationDetail.admission.finalResult'), details.final_result_date],
    [t('notificationDetail.admission.payment'), formatRange(details.payment_schedule)],
  ]

  return (
    <div className="mt-4 space-y-4">
      {(details.region || details.university_type) && (
        <p className="text-xs text-foreground-500">{[details.region, details.university_type].filter(Boolean).join(' · ')}</p>
      )}

      {notification.summary && <InfoSummary title={t('notificationDetail.law.summaryTitle')} text={notification.summary} />}
      {notification.reason && <InfoImportant title={t('recommend.reasonTitleUniversity')} text={notification.reason} />}

      {details.application_schedule && (
        <Section title={t('recommend.applicationDeadline')}>
          <div className="flex items-center gap-2">
            <span>{formatRange(details.application_schedule)}</span>
            <ApplicationDeadlineBadge t={t} range={details.application_schedule} />
          </div>
        </Section>
      )}

      <InfoTimeline title={t('recommend.timeline')} rows={timelineRows} />

      {eligibilityRows.some(([, value]) => value) && (
        <Section title={t('notificationDetail.admission.eligibility')}>
          <div className="space-y-2">
            {eligibilityRows.map(
              ([label, value]) =>
                value && (
                  <div key={label} className="flex justify-between gap-3 text-xs">
                    <span className="text-foreground-500">{label}</span>
                    <span className="text-right text-foreground-800">{value}</span>
                  </div>
                ),
            )}
          </div>
        </Section>
      )}

      {details.evaluation_ratio && (details.evaluation_ratio.document || details.evaluation_ratio.interview) && (
        <Section title={t('notificationDetail.admission.evaluationRatio')}>
          <div className="space-y-2">
            {details.evaluation_ratio.document && (
              <div>
                <div className="flex justify-between text-xs text-foreground-600">
                  <span>{t('notificationDetail.admission.ratioDocument')}</span>
                  <span>{details.evaluation_ratio.document}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-background-200">
                  <div className="h-2 rounded-full bg-primary-500" style={{ width: details.evaluation_ratio.document }} />
                </div>
              </div>
            )}
            {details.evaluation_ratio.interview && (
              <div>
                <div className="flex justify-between text-xs text-foreground-600">
                  <span>{t('notificationDetail.admission.ratioInterview')}</span>
                  <span>{details.evaluation_ratio.interview}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-background-200">
                  <div className="h-2 rounded-full bg-accent-500" style={{ width: details.evaluation_ratio.interview }} />
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {Array.isArray(details.documents) && details.documents.length > 0 && (
        <Section title={t('notificationDetail.admission.documents')}>
          <ul className="list-disc space-y-1 pl-4">
            {details.documents.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

// 맞춤 정보 상세 화면 — Details.jsx의 LAW/UNIVERSITY 카드에서 진입.
// 백엔드에 알림 단건 조회 API가 없어(목록/읽음 처리만 존재) 목록에서 클릭할 때 router state로
// 전체 notification 객체를 넘겨받아 렌더링함. 새로고침/직접 접근 시 state가 없으면 안내 후 목록으로 유도.
function NotificationDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notificationId } = useParams()
  const location = useLocation()
  const notification = location.state?.notification

  useEffect(() => {
    if (!notification || notification.isRead) return
    markNotificationRead(notification.notificationId).catch((error) =>
      console.error('[NotificationDetail] 읽음 처리 실패', error),
    )
  }, [notification])

  if (!notification) {
    return (
      <div className="min-h-screen p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">{t('recommend.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/details')}
          className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
        >
          {t('recommend.backToList')}
        </button>
      </div>
    )
  }

  const type = detectNotificationType(getNotificationDetails(notification))

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{notification.title}</h1>
      </div>

      <div className="px-6 py-6">
        {type === 'LAW' && <LawDetail t={t} notification={notification} />}
        {type === 'UNIVERSITY' && <UniversityDetail t={t} notification={notification} />}
        {type === 'GENERAL' && <Section title={t('recommend.reasonTitle')}>{notification.reason}</Section>}
      </div>
    </div>
  )
}

export default NotificationDetail
