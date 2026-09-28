import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { EstudosProvider } from './estado/Contexto'
import './index.css'

registerSW({ immediate: true }) // deixa o app funcionar offline

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <EstudosProvider>
        <App />
      </EstudosProvider>
    </HashRouter>
  </StrictMode>,
)
