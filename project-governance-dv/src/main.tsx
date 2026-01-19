import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'primereact/resources/themes/lara-light-amber/theme.css'
import 'primereact/resources/primereact.min.css'
import './pwc_compat.css'
import './pwc_light_mode.css'
import './styles/org-chart.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
