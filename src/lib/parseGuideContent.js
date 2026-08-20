// 백엔드가 스키마 변경 없이 content 문자열 안에 태그로 구조를 표시해서 내려주기로 함 (2026-08-17 백엔드 확인).
// 규칙: [SUMMARY] / [IMPORTANT] / [STEP N] / [CAUTION] 태그 줄 다음부터 다음 태그(또는 끝)까지가 본문.
// STEP은 본문의 첫 줄이 제목, 나머지 줄이 설명(여러 줄이면 이어붙임).
// 태그가 하나도 없으면 예전 방식(순수 텍스트) 가이드로 보고 null을 반환 — 호출부에서 기존 렌더링으로 대체.
const SECTION_TAG = /^\[([A-Z_]+)(?:\s+(\d+))?\]$/

export function parseGuideContent(content) {
  if (!content) return null

  const sections = []
  let current = null

  for (const rawLine of content.split('\n')) {
    const match = rawLine.trim().match(SECTION_TAG)
    if (match) {
      current = { tag: match[1], number: match[2] ? Number(match[2]) : null, lines: [] }
      sections.push(current)
      continue
    }
    if (current) current.lines.push(rawLine)
  }

  if (sections.length === 0) return null

  const joinBlock = (lines) => lines.join('\n').trim()

  const summarySection = sections.find((section) => section.tag === 'SUMMARY')
  const importantSection = sections.find((section) => section.tag === 'IMPORTANT')
  const cautionSection = sections.find((section) => section.tag === 'CAUTION')

  const steps = sections
    .filter((section) => section.tag === 'STEP')
    .map((section, index) => {
      const nonEmptyLines = section.lines.map((line) => line.trim()).filter(Boolean)
      const [title, ...rest] = nonEmptyLines
      return {
        number: section.number ?? index + 1,
        title: title ?? '',
        description: rest.join(' ').trim(),
      }
    })

  return {
    summary: summarySection ? joinBlock(summarySection.lines) : null,
    important: importantSection ? joinBlock(importantSection.lines) : null,
    caution: cautionSection ? joinBlock(cautionSection.lines) : null,
    steps,
  }
}
