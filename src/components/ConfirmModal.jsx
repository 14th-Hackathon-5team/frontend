// 공용 확인 모달 — 네이티브 window.confirm 대신 사용. 로그아웃/회원 탈퇴처럼
// "한 번 더 확인" 이 필요한 액션에서 사용.
function ConfirmModal({ title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] items-end justify-center bg-black/40 px-4 pb-8 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full rounded-3xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-center text-base font-bold text-foreground-950">{title}</p>
        {message && <p className="mt-2 text-center text-sm text-foreground-500">{message}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-background-200 bg-background-50 py-3 text-sm font-semibold text-foreground-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white ${
              danger ? 'bg-red-500' : 'bg-primary-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
