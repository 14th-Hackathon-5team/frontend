// 가이드 상세(GuideDetail)와 맞춤 정보 상세(NotificationDetail)가 공유하는 섹션 UI.
// 제목은 호출부에서 넘겨받아(용도별 문구가 다르므로) 스타일만 통일한다.
export function InfoSummary({ title, text }) {
  return (
    <div className="rounded-2xl border-l-4 border-primary-300 bg-background-100 p-4">
      <p className="text-xs font-semibold text-primary-600">{title}</p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground-800">{text}</p>
    </div>
  )
}

export function InfoImportant({ title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-primary-100 bg-[#FFF4E5] p-4">
      <span className="text-base leading-none" aria-hidden="true">⚠️</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-primary-600">{title}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground-800">{text}</p>
      </div>
    </div>
  )
}

export function InfoCaution({ title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-background-300 bg-background-100 p-4">
      <span className="text-base leading-none" aria-hidden="true">📌</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground-600">{title}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground-700">{text}</p>
      </div>
    </div>
  )
}

// 번호 배지 + 연결선 — 순서대로 "해야 할 일"을 나열할 때(가이드 단계별 방법).
export function InfoSteps({ title, steps }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-500">{title}</p>
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div key={step.number ?? step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                {step.number ?? index + 1}
              </span>
              {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-background-300" />}
            </div>
            <div className="min-w-0 pb-5">
              <p className="pt-0.5 text-sm font-semibold text-foreground-900">{step.title}</p>
              {step.description && <p className="mt-1 text-xs leading-relaxed text-foreground-600">{step.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 점 + 연결선 — 순서 개념 없이 "확인해야 할 사실들"을 나열할 때(맞춤 정보의 대상/상황/조치 등).
export function InfoTimeline({ title, rows }) {
  const visibleRows = rows.filter(([, value]) => value)
  if (visibleRows.length === 0) return null
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-500">{title}</p>
      <div>
        {visibleRows.map(([label, value], index) => (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${index === 0 ? 'bg-primary-500' : 'border border-foreground-300 bg-white'}`} />
              {index < visibleRows.length - 1 && <span className="mt-1 w-px flex-1 bg-background-200" />}
            </div>
            <div className="pb-4">
              <p className="text-xs font-semibold text-foreground-700">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
