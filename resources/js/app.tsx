import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { APP_NAME } from '@/lib/constants/app'

createInertiaApp({
    title: title => (title ? `${title} | ${APP_NAME}` : APP_NAME),
    resolve: async name => {
        const pages = import.meta.glob<{ default: any }>('./Pages/**/*.tsx')
        const page = pages[`./Pages/${name}.tsx`]
        if (!page) {
            throw new Error(`Page not found: Pages/${name}.tsx — check filename and casing`)
        }
        return (await page()).default
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
})
