import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ui/error-boundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <HeroUIProvider>
          <ToastProvider placement="top-right" maxVisibleToasts={5} />
          <App />
        </HeroUIProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

