import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGuidesByCategory } from '../lib/guidesApi'

const CATEGORIES = [
  { value: 'VISA', icon: '🛂' },
  { value: 'TOPIK_APPLICATION', icon: '📝' },
  { value: 'TOPIK_EXAM', icon: '✏️' },
  { value: 'LEGAL', icon: '⚖️' },
  { value: 'ACADEMIC', icon: '🎓' },
]

// 세부정보 화면 — GET /api/guides?category= 연동. 카테고리별로 가이드 목록을 불러와 보여줌.
function Details() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const highlightCategory = searchParams.get('category')
  const [guidesByCategory, setGuidesByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      CATEGORIES.map((category) =>
        getGuidesByCategory(category.value)
          .then((response) => [category.value, response.data.data])
          .catch((error) => {
            console.error(`[Details] ${category.value} 가이드 조회 실패`, error)
            return [category.value, []]
          }),
      ),
    ).then((entries) => {
      setGuidesByCategory(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!highlightCategory || loading) return
    document.getElementById(`category-${highlightCategory}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [highlightCategory, loading])

  if (loading) {
    return <p className="p-4 text-center text-sm text-foreground-400">{t('common.loading')}</p>
  }

  return (
    <div className="p-4">
      {CATEGORIES.map((category) => {
        const guides = guidesByCategory[category.value] ?? []
        const categoryTitle = t(`enums.guideCategory.${category.value}`)
        return (
          <div key={category.value} id={`category-${category.value}`} className="mb-6 scroll-mt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-foreground-500">{categoryTitle.toUpperCase()}</p>
            {guides.length === 0 ? (
              <p className="rounded-2xl border-2 border-gray-400 bg-background-50 p-4 text-sm text-foreground-400">
                {t('details.noGuides')}
              </p>
            ) : (
              <div className="space-y-3">
                {guides.map((guide) => (
                  <Link
                    key={guide.guideId}
                    to={`/guide/${guide.guideId}`}
                    className="flex items-center gap-3 rounded-2xl border-2 border-gray-400 bg-background-50 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-100/50 text-xl">
                      {category.icon}
                    </div>
                    <p className="flex-1 text-sm font-bold text-foreground-900">{guide.title}</p>
                    <span className="text-foreground-400">›</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Details
