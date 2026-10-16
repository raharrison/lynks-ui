import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {loadNativeSession} from '@/lib/server'

// Before the first render, since storage is async and the first request needs the server and token
await loadNativeSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
