/**
 * Utilitários de imagem.
 *
 * As imagens de demonstração vêm do Pexels (licença gratuita para uso
 * comercial). O CDN do Pexels permite pedir a imagem já recortada e
 * comprimida no tamanho exato, por isso geramos URLs com largura/altura.
 *
 * Para usar fotografias próprias, coloque-as em public/images/ e use o
 * caminho diretamente, ex.: image: '/images/produtos/bombons.webp'.
 */

const PEXELS_HOST = 'images.pexels.com'

/** Constrói o URL base de uma fotografia do Pexels a partir do seu ID. */
export function pexels(id: number): string {
  return `https://${PEXELS_HOST}/photos/${id}/pexels-photo-${id}.jpeg`
}

function isPexels(src: string): boolean {
  return src.includes(PEXELS_HOST)
}

/** Devolve o URL da imagem no tamanho pedido (só altera imagens do Pexels). */
export function imageUrl(src: string, width: number, height?: number): string {
  if (!isPexels(src)) return src
  const params = new URLSearchParams({ auto: 'compress', cs: 'tinysrgb', w: String(width) })
  if (height) {
    params.set('h', String(height))
    params.set('fit', 'crop')
  }
  return `${src.split('?')[0]}?${params.toString()}`
}

/**
 * Gera um srcset responsivo. `ratio` = altura / largura (1 para quadrado).
 * Para imagens locais devolve undefined (o browser usa o src).
 */
export function imageSrcSet(src: string, widths: number[], ratio?: number): string | undefined {
  if (!isPexels(src)) return undefined
  return widths.map((w) => `${imageUrl(src, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ')
}
