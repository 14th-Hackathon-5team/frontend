import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGuidesByCategory } from '../lib/guidesApi'
import { getMyInfo } from '../lib/authApi'
import { getNotifications } from '../lib/notificationsApi'
import { detectNotificationType, getNotificationDetails, getPriorityTier, sortByPriority } from '../lib/notificationHelpers'
import { getGuideTitleOverride } from '../lib/guideContent'

// "빠르게 찾아보기" 4개 타일과 같은 슬러그를 씀. guideCategories는 GET /api/guides?category=에 실제 존재하는
// enum(VISA/TOPIK_APPLICATION/TOPIK_EXAM/LEGAL/ACADEMIC)만 매핑 가능 — "일자리"는 대응 카테고리가 없어서
// 정적 콘텐츠로 구성함(사실 정보를 임의로 만들지 않기 위함).
const CATEGORY_CONFIG = {
  visa: { icon: '🛂', guideCategories: ['VISA', 'LEGAL'] },
  university: { icon: '🎓', guideCategories: ['ACADEMIC'], showRecommendations: true },
  topik: { icon: '📝', guideCategories: ['TOPIK_APPLICATION', 'TOPIK_EXAM'] },
  job: { icon: '💼', static: true },
}

// partTimeStatus/visaType 값이 없거나(로딩 실패 등) 알려지지 않은 값이면 DEFAULT 문구로 대체.
const PART_TIME_STATUS_KEYS = ['WORKING', 'SEARCHING', 'NOT_PLANNED']
const VISA_TYPE_KEYS = ['D2', 'D4', 'H1', 'F2', 'F5', 'F6']

function getVisaLabel(t, visaType) {
  const key = VISA_TYPE_KEYS.includes(visaType) ? visaType : 'DEFAULT'
  return t(`category.job.visaLabel.${key}`)
}

function getStatusBadge(t, partTimeStatus) {
  const key = PART_TIME_STATUS_KEYS.includes(partTimeStatus) ? partTimeStatus : 'DEFAULT'
  return t(`category.job.statusBadge.${key}`)
}

function getPartTimeConditionText(t, visaType) {
  const key = VISA_TYPE_KEYS.includes(visaType) ? visaType : 'DEFAULT'
  return t(`category.job.partTimeConditionDesc.${key}`)
}

// Home.jsx의 daysUntil과 동일한 계산이지만, 다른 탭 파일은 건드리지 않기 위해 이 파일 안에 그대로 둠.
function daysUntil(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

// 31일 이상 남았으면 정확한 일수를, 30일 이하/이미 지났으면 숫자 대신 상황에 맞는 안내 문구를 보여줌
// — 임박하거나 지난 날짜는 정확한 일수보다 "지금 뭘 해야 하는지"가 더 유용한 정보라서.
function getStayExpirationText(t, stayExpirationDate) {
  if (!stayExpirationDate) return t('category.job.stayExpirationUnknown')
  const days = daysUntil(stayExpirationDate)
  if (days > 30) return t('category.job.stayExpirationDays', { days })
  if (days >= 0) return t('category.job.stayExpirationClose')
  return t('category.job.stayExpirationExpired')
}

function MyStatusPreviewSkeleton() {
  return (
    <div className="glass-surface-accent animate-pulse rounded-2xl p-4">
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-background-200" />
        <div className="h-6 w-28 rounded-full bg-background-200" />
      </div>
      <div className="mt-4 h-3 w-20 rounded bg-background-200" />
      <div className="mt-3 space-y-3">
        <div className="h-8 rounded bg-background-200" />
        <div className="h-8 rounded bg-background-200" />
      </div>
    </div>
  )
}

function StatusChecklistRow({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-base shadow-sm" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-foreground-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">{description}</p>
      </div>
    </div>
  )
}

// "내 상황에서 확인하기" — visaType/partTimeStatus/stayExpirationDate(GET /api/users/me, Home.jsx와
// 동일한 getMyInfo 재사용)를 상단 배지 2개 + "지금 확인할 것" 행(row) 2개로 정리해서 보여줌.
// 조회 실패/미보유 값이어도 DEFAULT 문구로 대체해 화면이 깨지지 않게 함. 카드 안에 카드를 두지 않고
// 하나의 glass-surface-accent 카드 안에서 divide-y로 행을 구분함.
function MyStatusPreview({ t }) {
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [profile, setProfile] = useState({ visaType: null, partTimeStatus: null, stayExpirationDate: null })

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setProfile({ visaType: user.visaType, partTimeStatus: user.partTimeStatus, stayExpirationDate: user.stayExpirationDate })
        setStatus('ready')
      })
      .catch((error) => {
        console.error('[CategoryGuides] 내 정보 조회 실패', error)
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <section>
        <p className="mb-2 text-lg font-bold text-foreground-950">{t('category.job.myStatusTitle')}</p>
        <MyStatusPreviewSkeleton />
      </section>
    )
  }

  const visaType = status === 'error' ? null : profile.visaType
  const partTimeStatus = status === 'error' ? null : profile.partTimeStatus
  const stayExpirationDate = status === 'error' ? null : profile.stayExpirationDate

  return (
    <section>
      <p className="mb-2 text-lg font-bold text-foreground-950">{t('category.job.myStatusTitle')}</p>
      <div className="glass-surface-accent rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-primary-600 shadow-sm">
            {getVisaLabel(t, visaType)}
          </span>
          <span className="rounded-full bg-white/50 px-2.5 py-1 text-xs font-semibold text-foreground-600">
            {getStatusBadge(t, partTimeStatus)}
          </span>
        </div>

        <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-foreground-500">{t('category.job.checklistTitle')}</p>
        <div className="divide-y divide-white/60">
          <StatusChecklistRow
            icon="📄"
            title={t('category.job.partTimeConditionTitle')}
            description={getPartTimeConditionText(t, visaType)}
          />
          <StatusChecklistRow
            icon="🗓"
            title={t('category.job.stayExpirationTitle')}
            description={getStayExpirationText(t, stayExpirationDate)}
          />
          <StatusChecklistRow
            icon="📍"
            title={t('category.job.howToCheckTitle')}
            description={t('category.job.howToCheckDesc')}
          />
        </div>
      </div>
    </section>
  )
}

function UniversityRecommendationCard({ notification }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const details = getNotificationDetails(notification)

  return (
    <div
      onClick={() => navigate(`/details/notification/${notification.notificationId}`, { state: { notification } })}
      className="glass-surface-accent cursor-pointer rounded-2xl p-4 transition-transform active:scale-[0.98]"
    >
      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
        {t('recommend.universityBadge')}
      </span>
      <p className="mt-2 text-sm font-bold text-foreground-900">{notification.title}</p>
      {(details.region || details.university_type) && (
        <p className="mt-0.5 text-xs text-foreground-500">{[details.region, details.university_type].filter(Boolean).join(' · ')}</p>
      )}
      <p className="mt-1 text-xs leading-relaxed text-foreground-600">{notification.reason}</p>
    </div>
  )
}

// 디테일 탭 "빠르게 찾아보기" 타일에서 진입하는 카테고리별 정보 탐색 화면.
function CategoryGuides() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const config = CATEGORY_CONFIG[slug]

  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(!config?.static)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (!config || config.static) return
    Promise.all(config.guideCategories.map((category) => getGuidesByCategory(category).then((response) => response.data.data)))
      .then((lists) => setGuides(lists.flat()))
      .catch((error) => console.error(`[CategoryGuides] ${slug} 가이드 조회 실패`, error))
      .finally(() => setLoading(false))
  }, [config, slug])

  useEffect(() => {
    if (!config?.showRecommendations) return
    getNotifications()
      .then((response) => {
        const universityItems = (response.data.data ?? []).filter((n) => detectNotificationType(getNotificationDetails(n)) === 'UNIVERSITY')
        setRecommendations(sortByPriority(universityItems))
      })
      .catch((error) => console.error('[CategoryGuides] 추천 대학 조회 실패', error))
  }, [config])

  if (!config) {
    return (
      <div className="min-h-screen p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">{t('category.empty')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <div>
          <h1 className="text-base font-bold text-foreground-950">{t(`category.${slug}.title`)}</h1>
          <p className="text-xs text-foreground-500">{t(`category.${slug}.pageSubtitle`)}</p>
        </div>
      </div>

      <div className="space-y-3 px-6 py-6">
        {config.static ? (
          <MyStatusPreview t={t} />
        ) : (
          <>
            {config.showRecommendations && recommendations.length > 0 && (
              <div className="mb-2">
                <p className="mb-2 text-sm font-semibold text-foreground-700">{t('category.university.recommended')}</p>
                <div className="space-y-3">
                  {recommendations.map((notification) => (
                    <UniversityRecommendationCard key={notification.notificationId} notification={notification} />
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <p className="py-4 text-center text-sm text-foreground-400">{t('common.loading')}</p>
            ) : guides.length === 0 ? (
              <p className="glass-surface rounded-2xl p-4 text-sm text-foreground-400">{t('category.empty')}</p>
            ) : (
              guides.map((guide) => (
                <Link
                  key={guide.guideId}
                  to={`/guide/${guide.guideId}`}
                  className="glass-surface flex items-center gap-3 rounded-2xl p-4 transition-transform active:scale-[0.98]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDF6DC] text-xl">{config.icon}</div>
                  <p className="flex-1 text-sm font-bold text-foreground-900">
                    {getGuideTitleOverride(guide.guideId, i18n.language) ?? guide.title}
                  </p>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CategoryGuides
