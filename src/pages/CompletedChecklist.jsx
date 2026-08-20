import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toggleEventCompleted } from '../lib/calendarApi'
import { ChecklistItem } from './Home'

// 완료된 체크리스트 관리 화면 — Home.jsx "완료됨 (N)" 버튼에서 진입. 체크리스트 전용 조회 API가 없어서
// (Home.jsx 상단 주석 참고) 별도로 다시 불러오지 않고, Home에서 이미 계산해둔 완료 항목 목록을 router
// state로 그대로 받아 보여준다. 여기서 체크를 해제하면 더 이상 "완료"가 아니므로 이 목록에서 바로 빠짐.
function CompletedChecklist() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState(location.state?.items ?? [])

  const handleUncheck = (id) => {
    const removed = items.find((item) => item.id === id)
    setItems((prev) => prev.filter((item) => item.id !== id))
    toggleEventCompleted(id).catch((error) => {
      console.error('[CompletedChecklist] 완료 해제 실패', error)
      if (removed) setItems((prev) => [...prev, removed])
    })
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex items-center gap-3 border-b border-background-200 px-6 py-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-base font-bold text-foreground-950">{t('home.completedChecklist')}</h1>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-foreground-400">{t('completedChecklist.empty')}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <ChecklistItem key={item.id} item={item} checked onToggle={() => handleUncheck(item.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompletedChecklist
