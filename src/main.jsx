import { createRoot } from 'react-dom/client'
import './lib/devAuth' // 개발용 로그인 우회 — i18n/authStore보다 먼저 실행돼야 해서 최상단에 둔다.
import './index.css'
import './i18n'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)