import { useEffect } from 'react'
import { storeConfig } from '../config/store'

/** Define o título da página e a meta description. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${storeConfig.name}` : `${storeConfig.name} — ${storeConfig.tagline}`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description ?? storeConfig.description)
  }, [title, description])
}
