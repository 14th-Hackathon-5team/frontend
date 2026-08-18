const LANGUAGES = [
  { value: 'KOREAN', label: '한국어' },
  { value: 'ENGLISH', label: 'English' },
]

// 언어 선택 모달 — Settings의 "언어 설정" 항목에서 진입. 현재 UI 언어와 무관하게
// 안내 문구를 한국어/영어 둘 다 보여줌(둘 중 어느 쪽도 못 읽는 상태를 막기 위함).
function LanguageModal({ current, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] items-end justify-center bg-black/40 px-4 pb-8 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full rounded-3xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-center text-base font-bold text-foreground-950">변경할 언어를 선택해주세요</p>
        <p className="mb-5 text-center text-sm text-foreground-500">Please select a language</p>

        <div className="space-y-3">
          {LANGUAGES.map((language) => {
            const selected = current === language.value
            return (
              <button
                key={language.value}
                type="button"
                onClick={() => onSelect(language.value)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-background-200 bg-background-50 text-foreground-800'
                }`}
              >
                {language.label}
                {selected && <span className="text-primary-500">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LanguageModal
