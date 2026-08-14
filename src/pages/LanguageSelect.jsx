import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import birdLogo from '../assets/bird_logo.png'

const LANGUAGES = [
  { code: 'US', name: 'English', locale: 'English (United States)', value: 'ENGLISH' },
  { code: 'KR', name: '한국어', locale: '한국어 (대한민국)', value: 'KOREAN' },
]

function ChevronIcon({ direction }) {
  const d = direction === 'left' ? 'M12.5 15l-5-5 5-5' : 'M7.5 15l5-5-5-5'
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 언어선택 화면 — 최종 디자인(tqwhyl.readdy.co/) 반영.
function LanguageSelect() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const language = LANGUAGES[index]

  const goPrev = () => setIndex((current) => (current - 1 + LANGUAGES.length) % LANGUAGES.length)
  const goNext = () => setIndex((current) => (current + 1) % LANGUAGES.length)

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background-50 px-6 py-12">
      <div />

      <div className="flex flex-col items-center">
        <img src={birdLogo} alt="K-Buddy" className="h-28 w-28 object-contain" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground-950">Choose your language</h1>
        <p className="mt-2 text-sm text-foreground-500">Choose a language to continue</p>

        <div className="mt-12 flex items-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous language"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background-100 text-foreground-600"
          >
            <ChevronIcon direction="left" />
          </button>

          <div className="flex w-40 flex-col items-center">
            <span className="text-3xl font-extrabold text-foreground-950">{language.code}</span>
            <span className="text-xl font-bold text-foreground-950">{language.name}</span>
            <span className="mt-1 text-xs text-foreground-500">{language.locale}</span>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next language"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background-100 text-foreground-600"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        <p className="mt-10 flex items-center gap-2 text-xs text-foreground-400">
          <span aria-hidden="true">⇄</span>
          Swipe sideways to choose a language
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white"
        >
          Continue
        </button>

        <p className="pt-4 text-center text-xs text-foreground-400">
          © 2026 K-Buddy. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LanguageSelect
