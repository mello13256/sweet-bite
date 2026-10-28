import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { imageSrcSet, imageUrl } from '../../lib/images'
import { cn } from '../../lib/cn'

interface ProductImageProps {
  src: string
  alt: string
  /** Largura base pedida ao CDN */
  width: number
  /** altura / largura — 1 = quadrado */
  ratio?: number
  sizes?: string
  className?: string
  priority?: boolean
}

/**
 * Imagem com proporção fixa, srcset responsivo, carregamento diferido
 * e um estado de recurso discreto se a imagem falhar.
 */
export function ProductImage({ src, alt, width, ratio = 1, sizes, className, priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const height = Math.round(width * ratio)

  if (failed || !src) {
    return (
      <div className={cn('flex items-center justify-center bg-cream-100 text-cocoa-500', className)} role="img" aria-label={alt}>
        <ImageOff className="size-6" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={imageUrl(src, width, height)}
      srcSet={imageSrcSet(src, [Math.round(width / 2), width, width * 2], ratio)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn('bg-cream-100 object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  )
}
