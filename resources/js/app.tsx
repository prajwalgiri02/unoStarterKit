import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'

const appName = import.meta.env.VITE_APP_NAME || 'Borrowed'

createInertiaApp({
    title: title => (title ? `${title} | ${appName}` : appName),
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<string, { default: any }>
        const page = pages[`./Pages/${name}.tsx`]
        if (!page) {
            throw new Error(`Page not found: Pages/${name}.tsx — check filename and casing`)
        }
        return page.default  // ← explicitly return .default
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
})
