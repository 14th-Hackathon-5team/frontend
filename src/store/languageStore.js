import { create } from 'zustand'

// 로그인 전 LanguageSelect 화면에서 고른 값을 저장해뒀다가 회원가입 폼 기본값으로 사용.
// 로그인 후에는 백엔드 설정(GET /api/settings/me)이 우선하며, Settings 화면에서 바뀔 때마다 이 값도 갱신.
const useLanguageStore = create((set) => ({
  preferredLanguage: localStorage.getItem('preferredLanguage'),

  setPreferredLanguage: (preferredLanguage) => {
    localStorage.setItem('preferredLanguage', preferredLanguage)
    set({ preferredLanguage })
  },
}))

export default useLanguageStore
