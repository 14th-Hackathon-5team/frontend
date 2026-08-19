import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNotifications } from '../lib/notificationsApi'
import { getGuidesByCategory } from '../lib/guidesApi'
import { buildFeed, detectNotificationType, getPriorityTier } from '../lib/notificationHelpers'

// "빠르게 찾아보기" 타일 4개 — /details/category/:slug로 이동(CategoryGuides.jsx).
const QUICK_FIND = [
  { slug: 'visa', icon: '🛂' },
  { slug: 'university', icon: '🎓' },
  { slug: 'topik', icon: '📝' },
  { slug: 'prep', icon: '✓' },
]

// "추천 가이드" 섹션 — 카테고리별 대표 콘텐츠 1~2개만 보여주고 "전체 보기"는 CategoryGuides.jsx로 이동.
const GUIDE_PREVIEW_SECTIONS = [
  { slug: 'visa', icon: '🛂', guideCategories: ['VISA', 'LEGAL'] },
  { slug: 'topik', icon: '📝', guideCategories: ['TOPIK_APPLICATION', 'TOPIK_EXAM'] },
  { slug: 'university', icon: '🎓', guideCategories: ['ACADEMIC'] },
]

const PRIORITY_STYLE = {
  HIGH: 'bg-accent-100 text-accent-500',
  MEDIUM: 'bg-background-200 text-foreground-600',
  LOW: 'bg-background-100 text-foreground-400',
}

function PriorityBadge({ t, tier }) {
  const label = { HIGH: t('recommend.priorityHigh'), MEDIUM: t('recommend.priorityMedium'), LOW: t('recommend.priorityLow') }[tier]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[tier]}`}>{label}</span>
}

function FeedCard({ notification }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const type = detectNotificationType(notification.details)
  const tier = getPriorityTier(notification.priority)
  const details = notification.details ?? {}

  return (
    <div
      onClick={() => navigate(`/details/notification/${notification.notificationId}`, { state: { notification } })}
      className="glass-surface-accent w-[78%] shrink-0 snap-center cursor-pointer rounded-2xl p-5 transition-transform active:scale-[0.98]"
    >
      {type === 'UNIVERSITY' ? (
        <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {t('recommend.universityBadge')}
        </span>
      ) : (
        <PriorityBadge t={t} tier={tier} />
      )}
      <p className="mt-2 text-base font-bold text-foreground-900">{notification.title}</p>
      {type === 'UNIVERSITY' && (details.region || details.university_type) && (
        <p className="mt-0.5 text-xs text-foreground-500">{[details.region, details.university_type].filter(Boolean).join(' · ')}</p>
      )}
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground-700">{notification.reason}</p>
      <p className="mt-3 text-xs font-semibold text-primary-600">
        {type === 'UNIVERSITY' ? t('recommend.viewApplicationSchedule') : t('recommend.viewMore')} →
      </p>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      <div className="h-40 w-[78%] shrink-0 animate-pulse rounded-2xl bg-background-100" />
      <div className="h-40 w-[78%] shrink-0 animate-pulse rounded-2xl bg-background-100" />
    </div>
  )
}

function FeedError({ t, onRetry }) {
  return (
    <div className="glass-surface rounded-2xl p-6 text-center">
      <p className="text-sm font-semibold text-foreground-700">{t('recommend.errorTitle')}</p>
      <p className="mt-1 text-xs text-foreground-500">{t('recommend.errorSubtitle')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
      >
        {t('recommend.retry')}
      </button>
    </div>
  )
}

function FeedEmpty({ t }) {
  return (
    <div className="glass-surface rounded-2xl p-6 text-center">
      <p className="text-sm font-semibold text-foreground-700">{t('recommend.empty')}</p>
      <p className="mt-1 text-xs leading-relaxed text-foreground-500">{t('recommend.emptySubtitle')}</p>
    </div>
  )
}

// 가로 스와이프 카드뉴스 — 카드 중앙 정렬(snap-center) + 좌우 살짝 peek, 스크롤 위치로 현재 인덱스를 추적해
// 하단에 점 인디케이터(● ○ ○)를 표시. 자동 슬라이드는 넣지 않음(요청사항).
function FeedCarousel({ items }) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || track.children.length === 0) return
    const cardWidth = track.children[0].offsetWidth + 12 // gap-3 = 12px
    setActiveIndex(Math.round(track.scrollLeft / cardWidth))
  }, [])

  return (
    <div>
      <div ref={trackRef} onScroll={handleScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {items.map((notification) => (
          <FeedCard key={notification.notificationId} notification={notification} />
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((notification, index) => (
            <span
              key={notification.notificationId}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-4 bg-primary-500' : 'w-1.5 bg-background-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function QuickFindGrid({ t }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUICK_FIND.map((item) => (
        <Link
          key={item.slug}
          to={`/details/category/${item.slug}`}
          className="glass-surface flex items-center gap-3 rounded-2xl p-3 transition-transform active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF6DC] text-lg">{item.icon}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground-900">{t(`category.${item.slug}.title`)}</p>
            <p className="truncate text-[11px] text-foreground-500">{t(`category.${item.slug}.subtitle`)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function GuidePreviewSection({ t, section, guides }) {
  if (guides.length === 0) return null
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground-700">{t(`category.${section.slug}.title`)}</p>
        <Link to={`/details/category/${section.slug}`} className="text-xs font-semibold text-primary-600">
          {t('recommend.seeAll')}
        </Link>
      </div>
      <div className="space-y-3">
        {guides.slice(0, 2).map((guide) => (
          <Link
            key={guide.guideId}
            to={`/guide/${guide.guideId}`}
            className="glass-surface flex items-center gap-3 rounded-2xl p-4 transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDF6DC] text-xl">{section.icon}</div>
            <p className="flex-1 text-sm font-bold text-foreground-900">{guide.title}</p>
            <span className="text-3xl text-foreground-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// 세부정보("맞춤 정보") 화면.
// 1) 나에게 필요한 정보 — GET /notifications를 priority순 + 제목중복제거(buildFeed)해서 가로 카드뉴스로.
//    LAW/UNIVERSITY는 details 모양(가변 JSON)으로 구분(notificationHelpers.detectNotificationType).
//    카드 클릭 시 /details/notification/:id로 이동(상세는 NotificationDetail.jsx).
// 2) 빠르게 찾아보기 — 비자·체류/대학·진학/TOPIK/준비물 4개 카테고리 진입점(CategoryGuides.jsx).
// 3) 추천 가이드 — GET /api/guides?category=를 카테고리별로 묶어 대표 1~2개만 미리보기.
function Details() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  const [guidesByCategory, setGuidesByCategory] = useState({})

  const fetchNotifications = useCallback(() => {
    setStatus('loading')
    getNotifications()
      .then((response) => {
        setNotifications(response.data.data ?? [])
        setStatus('ready')
      })
      .catch((error) => {
        console.error('[Details] 알림 목록 조회 실패', error)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const allCategories = [...new Set(GUIDE_PREVIEW_SECTIONS.flatMap((section) => section.guideCategories))]
    Promise.all(
      allCategories.map((category) =>
        getGuidesByCategory(category)
          .then((response) => [category, response.data.data])
          .catch((error) => {
            console.error(`[Details] ${category} 가이드 조회 실패`, error)
            return [category, []]
          }),
      ),
    ).then((entries) => setGuidesByCategory(Object.fromEntries(entries)))
  }, [])

  const feed = buildFeed(notifications)

  return (
    <div className="p-4">
      <div className="mb-5">
        <p className="text-lg font-bold text-foreground-950">{t('recommend.title')}</p>
        <p className="mt-1 text-xs text-foreground-500">{t('recommend.subtitle')}</p>
      </div>

      <section className="mb-6">
        <p className="mb-2 text-sm font-semibold text-foreground-700">{t('recommend.feedTitle')}</p>
        {status === 'loading' && <FeedSkeleton />}
        {status === 'error' && <FeedError t={t} onRetry={fetchNotifications} />}
        {status === 'ready' && feed.length === 0 && <FeedEmpty t={t} />}
        {status === 'ready' && feed.length > 0 && <FeedCarousel items={feed} />}
      </section>

      <section className="mb-6">
        <p className="mb-2 text-sm font-semibold text-foreground-700">{t('recommend.quickFindTitle')}</p>
        <QuickFindGrid t={t} />
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold text-foreground-700">{t('recommend.guideSectionTitle')}</p>
        {GUIDE_PREVIEW_SECTIONS.map((section) => {
          const guides = section.guideCategories.flatMap((category) => guidesByCategory[category] ?? [])
          return <GuidePreviewSection key={section.slug} t={t} section={section} guides={guides} />
        })}
      </section>
    </div>
  )
}

export default Details
