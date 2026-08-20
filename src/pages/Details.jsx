import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNotifications } from '../lib/notificationsApi'
import { getNews } from '../lib/newsApi'
import { getMyInfo } from '../lib/authApi'
import { getClientRecommendations } from '../lib/clientRecommendations'
import { buildFeed, detectNotificationType, getNotificationDetails, getPriorityTier } from '../lib/notificationHelpers'

// "추천 가이드" 타일 4개 — /details/category/:slug로 이동(CategoryGuides.jsx).
const QUICK_FIND = [
  { slug: 'visa', icon: '🛂' },
  { slug: 'university', icon: '🎓' },
  { slug: 'topik', icon: '📝' },
  { slug: 'job', icon: '💼' },
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
  const details = getNotificationDetails(notification)
  const type = detectNotificationType(details)
  const tier = getPriorityTier(notification.priority)

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
      <div ref={trackRef} onScroll={handleScroll} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
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


// 유학생 뉴스 카드 — GET /api/news(백엔드가 AI 서버 대신 호출: 네이버 뉴스 검색 + AI 요약).
// 개별 뉴스에 ID가 없어서 목록 인덱스를 라우트 파라미터로 쓰고, 전체 news 객체는 router state로 넘김
// (NotificationDetail.jsx와 동일한 패턴 — 백엔드에 단건 조회 API가 없음).
function NewsCard({ news, index }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/details/news/${index}`, { state: { news } })}
      className="glass-surface w-[78%] shrink-0 snap-center cursor-pointer rounded-2xl p-4 transition-transform active:scale-[0.98]"
    >
      <p className="line-clamp-2 text-sm font-bold text-foreground-900">{news.title}</p>
      <ul className="mt-2 space-y-1">
        {(news.threeLineSummary ?? []).map((line, lineIndex) => (
          <li key={lineIndex} className="line-clamp-1 text-xs leading-relaxed text-foreground-600">
            · {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NewsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      <div className="h-32 w-[78%] shrink-0 animate-pulse rounded-2xl bg-background-100" />
      <div className="h-32 w-[78%] shrink-0 animate-pulse rounded-2xl bg-background-100" />
    </div>
  )
}

function NewsSection({ t, status, items, onRetry }) {
  return (
    <section>
      <div className="mb-2">
        <p className="text-lg font-bold text-foreground-950">{t('recommend.newsTitle')}</p>
        <p className="mt-1 text-xs text-foreground-500">{t('recommend.newsSubtitle')}</p>
      </div>
      {status === 'loading' && <NewsSkeleton />}
      {status === 'error' && <FeedError t={t} onRetry={onRetry} />}
      {status === 'ready' && items.length === 0 && (
        <div className="glass-surface rounded-2xl p-4 text-center text-sm text-foreground-400">{t('recommend.newsEmpty')}</div>
      )}
      {status === 'ready' && items.length > 0 && (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {items.map((news, index) => (
            <NewsCard key={`${news.title}-${index}`} news={news} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

// 세부정보("맞춤 정보") 화면.
// 1) 나에게 필요한 정보 — GET /notifications + 프론트 자체 계산 추천(clientRecommendations.js, 외국인등록·
//    시간제취업 허가 — 백엔드 AI가 아직 감지 안 하는 항목만 프로필로 보충)을 합쳐 priority순 +
//    제목중복제거(buildFeed)해서 가로 카드뉴스로. LAW/UNIVERSITY는 details 모양(가변 JSON)으로 구분
//    (notificationHelpers.detectNotificationType). 카드 클릭 시 /details/notification/:id로 이동(상세는
//    NotificationDetail.jsx).
// 2) 추천 가이드 — 비자·체류/대학·진학/TOPIK/일자리 4개 카테고리 진입점(CategoryGuides.jsx).
// 3) 유학생 뉴스 — GET /api/news(백엔드가 AI 서버의 네이버 뉴스 검색+요약을 대신 호출). 개별 뉴스에
//    ID가 없어 목록 인덱스 + router state로 상세(NewsDetail.jsx)에 데이터를 넘김.
function Details() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  const [news, setNews] = useState([])
  const [newsStatus, setNewsStatus] = useState('loading')

  const fetchNotifications = useCallback(() => {
    setStatus('loading')
    // 프로필 조회 실패는 서버 알림 표시를 막지 않도록 별도로 흡수(클라이언트 추천만 빠짐).
    Promise.all([getNotifications(), getMyInfo().catch(() => null)])
      .then(([notificationsResponse, profileResponse]) => {
        const serverNotifications = notificationsResponse.data.data ?? []
        const clientRecommendations = getClientRecommendations(profileResponse?.data?.data, t)
        setNotifications([...serverNotifications, ...clientRecommendations])
        setStatus('ready')
      })
      .catch((error) => {
        console.error('[Details] 알림 목록 조회 실패', error)
        setStatus('error')
      })
  }, [t])

  const fetchNews = useCallback(() => {
    setNewsStatus('loading')
    getNews()
      .then((response) => {
        setNews(response.data?.data ?? [])
        setNewsStatus('ready')
      })
      .catch((error) => {
        console.error('[Details] 뉴스 조회 실패', error)
        setNewsStatus('error')
      })
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const feed = buildFeed(notifications)

  return (
    <div className="p-4 pt-8">
      <div className="mb-5">
        <p className="text-lg font-bold text-foreground-950">{t('recommend.title')}</p>
        <p className="mt-1 text-xs text-foreground-500">{t('recommend.subtitle')}</p>
      </div>

      <section>
        {status === 'loading' && <FeedSkeleton />}
        {status === 'error' && <FeedError t={t} onRetry={fetchNotifications} />}
        {status === 'ready' && feed.length === 0 && <FeedEmpty t={t} />}
        {status === 'ready' && feed.length > 0 && <FeedCarousel items={feed} />}
      </section>

      <hr className="my-6 border-t border-background-200" />

      <section>
        <p className="mb-2 text-lg font-bold text-foreground-950">{t('recommend.guideSectionTitle')}</p>
        <QuickFindGrid t={t} />
      </section>

      <hr className="my-6 border-t border-background-200" />

      <NewsSection t={t} status={newsStatus} items={news} onRetry={fetchNews} />
    </div>
  )
}

export default Details
