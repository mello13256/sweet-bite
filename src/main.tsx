import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { storeConfig } from './config/store'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import './index.css'

// Aplica as cores definidas em src/config/store.ts.
for (const [token, value] of Object.entries(storeConfig.colors)) {
  document.documentElement.style.setProperty(`--color-${token}`, value)
}
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', storeConfig.colors['cream-50'])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
