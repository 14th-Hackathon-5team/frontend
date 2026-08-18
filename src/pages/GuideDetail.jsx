import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGuideDetail } from '../lib/guidesApi'

// 가이드 상세 화면 — GET /api/guides/{guideId} 연동. 하단 탭 네비게이션 없이 단독 화면(뒤로가기만 존재).
// 백엔드 응답이 title/content/referenceUrl만 제공하므로 이전의 단계별 안내·팁·FAQ 구성은 제공하지 않음.
function GuideDetail() {
  const { t } = useTranslation()
  const { guideId } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getGuideDetail(guideId)
      .then((response) => setGuide(response.data.data))
      .catch((error) => {
        console.error('[GuideDetail] 가이드 상세 조회 실패', error)
        setNotFound(true)
      })
  }, [guideId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-background-50 p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">{t('guideDetail.notFound')}</p>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background-50 p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-400">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-50 pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{guide.title}</h1>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent-200 to-accent-100 p-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            {t(`enums.guideCategory.${guide.category}`, { defaultValue: guide.category })}
          </span>
          <h2 className="mt-3 text-xl font-bold text-foreground-950">{guide.title}</h2>
        </div>

        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground-800">{guide.content}</p>

        {guide.referenceUrl && (
          <a
            href={guide.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white"
          >
            {t('guideDetail.referenceLink')}
          </a>
        )}
      </div>
    </div>
  )
}

export default GuideDetail
