import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGuidesByCategory } from '../lib/guidesApi'
import { getNotifications } from '../lib/notificationsApi'
import { detectNotificationType, getPriorityTier, sortByPriority } from '../lib/notificationHelpers'

// "빠르게 찾아보기" 4개 타일과 같은 슬러그를 씀. guideCategories는 GET /api/guides?category=에 실제 존재하는
// enum(VISA/TOPIK_APPLICATION/TOPIK_EXAM/LEGAL/ACADEMIC)만 매핑 가능 — "준비물"은 대응 카테고리가 없어서
// 다른 화면으로 안내하는 정적 링크 목록으로 구성함(사실 정보를 임의로 만들지 않기 위함).
const CATEGORY_CONFIG = {
  visa: { icon: '🛂', guideCategories: ['VISA', 'LEGAL'] },
  university: { icon: '🎓', guideCategories: ['ACADEMIC'], showRecommendations: true },
  topik: { icon: '📝', guideCategories: ['TOPIK_APPLICATION', 'TOPIK_EXAM'] },
  prep: { icon: '✓', static: true },
}

const PREP_LINKS = [
  { labelKey: 'category.prep.university', to: '/details/category/university' },
  { labelKey: 'category.prep.visa', to: '/details/category/visa' },
  { labelKey: 'category.prep.registration', to: '/details/category/visa' },
  { labelKey: 'category.prep.topik', to: '/details/category/topik' },
]

function UniversityRecommendationCard({ notification }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const details = notification.details ?? {}

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
  const { t } = useTranslation()
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
        const universityItems = (response.data.data ?? []).filter((n) => detectNotificationType(n.details) === 'UNIVERSITY')
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
          PREP_LINKS.map((link) => (
            <Link
              key={link.labelKey}
              to={link.to}
              className="glass-surface flex items-center gap-3 rounded-2xl p-4 transition-transform active:scale-[0.98]"
            >
              <p className="flex-1 text-sm font-bold text-foreground-900">{t(link.labelKey)}</p>
              <span className="text-3xl text-foreground-400">›</span>
            </Link>
          ))
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
                  <p className="flex-1 text-sm font-bold text-foreground-900">{guide.title}</p>
                  <span className="text-3xl text-foreground-400">›</span>
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
