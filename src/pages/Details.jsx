import { Link } from 'react-router-dom'
import { GUIDE_LINKS } from '../constants/guides'

const TIP_CARDS = [
  { title: 'Alien Registration Guide', subtitle: 'Apply within 90 days of entry', to: '/guide/visa', icon: '🪪' },
  { title: 'How to Get Health Checkup', subtitle: 'Free checkup for the insured', icon: '🏥' },
  { title: 'TOPIK Registration Tips', subtitle: 'Check schedule and materials', to: '/guide/topik', icon: '📝' },
]

// 세부정보 화면 — 최종 디자인 기준. 상단 팁 카드 캐러셀 + 가이드 카테고리 리스트.
function Details() {
  return (
    <div className="p-4">
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {TIP_CARDS.map((card) => {
          const content = (
            <div
              className={`flex w-[268px] shrink-0 flex-col overflow-hidden rounded-2xl border border-accent-200 bg-background-50 transition ${
                card.to ? 'hover:brightness-95' : ''
              }`}
            >
              <div className="flex h-36 shrink-0 items-center justify-center bg-gradient-to-br from-accent-200/50 to-accent-100/50 text-5xl">
                {card.icon}
              </div>
              <div className="h-[65px] px-4 py-2">
                <p className="line-clamp-2 text-sm font-bold text-foreground-950">{card.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-foreground-700">{card.subtitle}</p>
              </div>
            </div>
          )
          return card.to ? (
            <Link key={card.title} to={card.to}>
              {content}
            </Link>
          ) : (
            <div key={card.title}>{content}</div>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {GUIDE_LINKS.map((guide) => (
          <Link
            key={guide.id}
            to={`/guide/${guide.id}`}
            className="flex items-center gap-3 rounded-2xl border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-100/50 text-xl">
              {guide.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground-900">{guide.title}</p>
              <p className="text-xs text-foreground-500">{guide.subtitle}</p>
            </div>
            <span className="text-foreground-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Details
