import { RouterProvider } from 'react-router-dom'
import router from './router/router'

// 375px 기준 모바일 웹앱 — 넓은 화면(데스크톱)에서도 430px로 폭을 제한해 모바일 레이아웃을 유지.
function App() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background-50">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
