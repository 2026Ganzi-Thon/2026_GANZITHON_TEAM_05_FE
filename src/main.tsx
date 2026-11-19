import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { clearLegacyMockStorage } from '@/mocks/clearLegacyStorage'
import '@/styles/index.css'

clearLegacyMockStorage()

// 배포 빌드에서만 서비스 워커를 등록한다 (앱 설치 · 오프라인 안내). 개발 서버에서는 등록하지 않는다.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
