import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// 뉴스 상세 화면 — Details.jsx의 뉴스 카드에서 진입. 백엔드에 뉴스 단건 조회 API가 없고 개별 뉴스에
// ID도 없어서(목록 응답에 title/threeLineSummary/detailedSummary/link뿐) NotificationDetail.jsx와 동일하게
// router state로 전체 news 객체를 넘겨받아 렌더링함. 새로고침/직접 접근 시 state가 없으면 안내 후 목록으로 유도.
function NewsDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const news = location.state?.news

  if (!news) {
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

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{news.title}</h1>
      </div>

      <div className="px-6 py-6">
        <p className="text-sm leading-relaxed text-foreground-800">{news.detailedSummary}</p>

        {news.link && (
          <a
            href={news.link}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          >
            {t('recommend.newsViewOriginal')}
          </a>
        )}
      </div>
    </div>
  )
}

export default NewsDetail
