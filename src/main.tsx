import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
// PWA service worker registration handled by vite-plugin-pwa automatically via registerSW if configured, 
// or manual. "registerType: 'autoUpdate'" in vite config handles it usually, but we need 'virtual:pwa-register' usage?
// vite-plugin-pwa injects registration if we use injectRegister strategy or we import it.
// We will use the simple auto-update.

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30, // 30 seconds
            retry: 2,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
)
