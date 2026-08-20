import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGuideDetail } from '../lib/guidesApi'
import { parseGuideContent } from '../lib/parseGuideContent'
import { getGuideContentOverride, getGuideTitleOverride } from '../lib/guideContent'
import { InfoSummary, InfoImportant, InfoSteps, InfoCaution } from '../components/InfoSections'

// 가이드 상세 화면 — GET /api/guides/{guideId} 연동. 하단 탭 네비게이션 없이 단독 화면(뒤로가기만 존재).
// 백엔드가 content 문자열 안에 [SUMMARY]/[IMPORTANT]/[STEP N]/[CAUTION] 태그로 구조를 표시해주면(2026-08-17
// 백엔드 확인, parseGuideContent.js) 섹션별 UI로 렌더링. 지금은(2026-08-20) 7개 가이드 전부 태그 없이
// 1~2문장짜리 평문이라, API 파싱이 실패하면 GUIDE_CONTENT_OVERRIDES(guideId별 프론트 자체 상세 콘텐츠)를
// 2차로 시도한다 — 백엔드가 나중에 실제로 태그를 채워주면 이 override 없이도 API 콘텐츠가 자동 우선 적용됨.
// 그마저도 없으면 예전처럼 순수 텍스트로 대체.
function GuideDetail() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { guideId } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const parsed = useMemo(() => {
    if (!guide) return null
    const override = parseGuideContent(getGuideContentOverride(guide.guideId, locale))
    if (locale !== 'ko' && override) return override
    return parseGuideContent(guide.content) ?? override
  }, [guide, locale])
  const title = (locale !== 'ko' && getGuideTitleOverride(guide?.guideId, locale)) || guide?.title
  const fallbackText = (locale !== 'ko' && getGuideContentOverride(guide?.guideId, locale)) || guide?.content

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
      <div className="min-h-screen p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">{t('guideDetail.notFound')}</p>
      </div>
    )
  }

  if (!guide) {
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
        <h1 className="text-base font-bold text-foreground-950">{title}</h1>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent-200 to-accent-100 p-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            {t(`enums.guideCategory.${guide.category}`, { defaultValue: guide.category })}
          </span>
          <h2 className="mt-3 text-xl font-bold text-foreground-950">{title}</h2>
        </div>

        {parsed ? (
          <div className="mt-6 space-y-4">
            {parsed.summary && <InfoSummary title={t('guideDetail.summaryTitle')} text={parsed.summary} />}
            {parsed.important && <InfoImportant title={t('guideDetail.importantTitle')} text={parsed.important} />}
            {parsed.steps.length > 0 && <InfoSteps title={t('guideDetail.stepsTitle')} steps={parsed.steps} />}
            {parsed.caution && <InfoCaution title={t('guideDetail.cautionTitle')} text={parsed.caution} />}
          </div>
        ) : (
          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground-800">{fallbackText}</p>
        )}

          {guide.referenceUrl && (
          <a href={guide.referenceUrl} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white">
            {t('guideDetail.referenceLink')}
          </a>
        )}
      </div>
    </div>
  )
}

export default GuideDetail