import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { clearLegacyMockStorage } from '@/mocks/clearLegacyStorage'
import '@/styles/index.css'

clearLegacyMockStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
