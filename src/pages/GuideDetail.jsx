import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GUIDES } from '../constants/guides'

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-background-200 py-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground-900"
      >
        {q}
        <span className="text-foreground-400">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="mt-2 text-sm text-foreground-600">{a}</p>}
    </div>
  )
}

// 가이드 상세 화면 — 최종 디자인 기준, 하단 탭 네비게이션 없이 단독 화면(뒤로가기만 존재).
function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const guide = GUIDES[id]

  if (!guide) {
    return (
      <div className="min-h-screen bg-background-50 p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-xl text-foreground-700">
          ‹
        </button>
        <p className="text-foreground-600">가이드를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-50 pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{guide.title}</h1>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent-200 to-accent-100 p-5">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
            {guide.icon}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
            Official Guide
          </span>
          <p className="mt-2 text-xs text-foreground-700">🕐 {guide.readTime}</p>
          <h2 className="mt-3 text-xl font-bold text-foreground-950">{guide.title}</h2>
          <p className="mt-2 text-sm text-foreground-700">{guide.description}</p>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl bg-accent-100 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white">
            ⚠
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-900">Important</p>
            <p className="mt-1 text-sm text-foreground-700">{guide.important}</p>
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-base font-bold text-foreground-950">Step-by-Step Guide</h3>
        <div className="space-y-3">
          {guide.steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-background-200 bg-white p-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground-900">{step.title}</p>
                  <p className="mt-1 text-sm text-foreground-600">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-6 text-base font-bold text-foreground-950">Pro Tips</h3>
        <ul className="space-y-2 rounded-2xl border border-background-200 bg-white p-4">
          {guide.proTips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-foreground-700">
              <span className="text-primary-500">•</span>
              {tip}
            </li>
          ))}
        </ul>

        <h3 className="mb-1 mt-6 text-base font-bold text-foreground-950">Frequently Asked Questions</h3>
        <div className="rounded-2xl border border-background-200 bg-white px-4">
          {guide.faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default GuideDetail
