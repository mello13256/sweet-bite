import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, CircleX, PackageX, ShoppingBag, Store, Truck } from 'lucide-react'
import { Price } from '../components/product/Price'
import { ProductBadges } from '../components/product/ProductBadges'
import { ProductGrid } from '../components/product/ProductGrid'
import { VariantSelector } from '../components/product/VariantSelector'
import { Button, ButtonLink } from '../components/ui/Button'
import { Alert, EmptyState, SectionHeading, Skeleton } from '../components/ui/misc'
import { ProductImage } from '../components/ui/ProductImage'
import { QuantityInput } from '../components/ui/QuantityInput'
import { storeConfig } from '../config/store'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { sortProducts } from '../lib/catalog'
import { cn } from '../lib/cn'
import { formatPrice } from '../lib/money'
import {
  basePrice,
  defaultVariant,
  effectiveDiscount,
  finalPrice,
  hasAvailableOption,
  isOnSale,
  isPurchasable,
} from '../lib/pricing'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { getProductBySlug, getCategory, products, status } = useCatalog()
  const product = getProductBySlug(slug)
  const { addItem } = useCart()

  const [variantId, setVariantId] = useState<string | undefined>(() => (product ? defaultVariant(product)?.id : undefined))
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setVariantId(product ? defaultVariant(product)?.id : undefined)
    setQuantity(1)
    setActiveImage(0)
  }, [product])

  usePageMeta(product?.name ?? (status === 'loading' ? 'A carregar…' : 'Produto não encontrado'), product?.shortDescription)

  const related = useMemo(() => {
    if (!product) return []
    const sameCategory = products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    const others = products.filter((p) => p.id !== product.id && p.categoryId !== product.categoryId)
    return [...sortProducts(sameCategory, 'popularidade'), ...sortProducts(others, 'popularidade')]
      .filter(hasAvailableOption)
      .slice(0, 4)
  }, [product, products])

  if (status === 'loading' && !product) {
    return (
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageX className="size-7" aria-hidden />}
          title="Produto não encontrado"
          description="Este produto pode ter sido removido ou o endereço está incorreto."
          action={<ButtonLink to="/loja">Ver todos os produtos</ButtonLink>}
        />
      </div>
    )
  }

  const category = getCategory(product.categoryId)
  const images = [product.image, ...(product.gallery ?? [])]
  const hasVariants = !!product.variants?.length
  const purchasable = isPurchasable(product, variantId)
  const anyAvailable = hasAvailableOption(product)
  const price = finalPrice(product, variantId)
  const compareAt = isOnSale(product) ? basePrice(product, variantId) : undefined

  const handleAdd = () => {
    if (addItem(product, variantId, quantity)) setQuantity(1)
  }

  return (
    <div className="container-page pt-6 sm:pt-8">
      <nav aria-label="Navegação estrutural" className="flex items-center gap-2 text-sm text-cocoa-500">
        <Link to="/loja" className="inline-flex items-center gap-1.5 hover:text-cocoa-900 lg:hidden">
          <ArrowLeft className="size-4" aria-hidden /> Voltar à loja
        </Link>
        <span className="hidden lg:contents">
          <Link to="/" className="hover:text-cocoa-900">
            Início
          </Link>
          <span aria-hidden>/</span>
          {category && (
            <>
              <Link to={`/loja?categoria=${category.id}`} className="hover:text-cocoa-900">
                {category.name}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-cocoa-800">{product.name}</span>
        </span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Galeria */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-card">
            <ProductImage
              src={images[activeImage] ?? product.image}
              alt={product.name}
              width={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className={cn('aspect-square w-full', !anyAvailable && 'grayscale-[50%]')}
            />
            <ProductBadges product={product} className="absolute top-4 left-4" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'overflow-hidden rounded-xl ring-offset-2 ring-offset-cream-50 transition',
                    i === activeImage ? 'ring-2 ring-brand-500' : 'opacity-70 hover:opacity-100',
                  )}
                  aria-label={`Ver imagem ${i + 1}`}
                  aria-pressed={i === activeImage}
                >
                  <ProductImage src={src} alt="" width={160} className="size-16 sm:size-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informação e compra */}
        <div>
          {category && (
            <Link to={`/loja?categoria=${category.id}`} className="eyebrow hover:text-brand-800">
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-[2.1rem] leading-tight font-semibold sm:text-[2.6rem]">{product.name}</h1>

          <div className="mt-4">
            <Price price={price} compareAt={compareAt} size="lg" />
            {isOnSale(product) && compareAt !== undefined && (
              <p className="mt-1 text-sm font-medium text-brand-700">
                Poupa {formatPrice(compareAt - price)} ({effectiveDiscount(product)}% de desconto)
              </p>
            )}
            <p className="mt-1 text-xs text-cocoa-500">IVA incluído. Entrega calculada na confirmação da encomenda.</p>
          </div>

          <p className="mt-6 text-[17px] leading-relaxed text-cocoa-700">{product.description}</p>

          <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-semibold text-cocoa-900">Categoria</dt>
            <dd className="text-cocoa-700">{category?.name ?? '—'}</dd>
            <dt className="font-semibold text-cocoa-900">Disponibilidade</dt>
            <dd>
              {purchasable ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                  <CircleCheck className="size-4" aria-hidden /> Disponível para encomenda
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
                  <CircleX className="size-4" aria-hidden /> {anyAvailable ? 'Opção esgotada' : 'Esgotado'}
                </span>
              )}
            </dd>
          </dl>

          <div className="mt-8 space-y-6 rounded-3xl border border-cocoa-900/[0.07] bg-white p-5 shadow-card sm:p-6">
            {hasVariants && product.variants!.length > 1 && (
              <VariantSelector
                label={product.variantLabel ?? 'Opção'}
                variants={product.variants!}
                value={variantId}
                discount={effectiveDiscount(product)}
                onChange={setVariantId}
              />
            )}
            {hasVariants && product.variants!.length === 1 && (
              <p className="text-sm text-cocoa-700">
                <span className="font-semibold text-cocoa-900">{product.variantLabel ?? 'Opção'}:</span>{' '}
                {product.variants![0]!.label}
              </p>
            )}

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="mb-2.5 text-sm font-semibold text-cocoa-900" id="qty-label">
                  Quantidade
                </p>
                <QuantityInput value={quantity} onChange={setQuantity} label="Quantidade" disabled={!purchasable} />
              </div>
              <Button
                size="lg"
                className="min-w-0 flex-1 basis-56"
                onClick={handleAdd}
                disabled={!purchasable}
                icon={<ShoppingBag className="size-5" aria-hidden />}
              >
                {purchasable ? `Adicionar ao carrinho · ${formatPrice(price * quantity)}` : 'Indisponível'}
              </Button>
            </div>
            {!anyAvailable && (
              <Alert tone="warning">
                Este produto está esgotado de momento. Pode perguntar-nos pela reposição através dos{' '}
                <Link to="/contactos" className="font-semibold underline">
                  contactos
                </Link>
                .
              </Alert>
            )}
            <ul className="grid gap-3 border-t border-cocoa-900/[0.07] pt-5 text-sm text-cocoa-700 sm:grid-cols-2">
              <li className="flex items-center gap-2.5">
                <Store className="size-[18px] text-brand-600" aria-hidden /> Levantamento na loja
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="size-[18px] text-brand-600" aria-hidden /> Entrega na zona da loja
              </li>
            </ul>
          </div>

          {/* Detalhes e alergénios */}
          <div className="mt-8 divide-y divide-cocoa-900/10 border-y border-cocoa-900/10">
            {product.details && product.details.length > 0 && (
              <details className="group py-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-cocoa-900">
                  Detalhes do produto
                  <span className="text-xl leading-none text-cocoa-500 transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-cocoa-700">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </details>
            )}
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-cocoa-900">
                Alergénios
                <span className="text-xl leading-none text-cocoa-500 transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <div className="mt-3 space-y-2 text-sm text-cocoa-700">
                {product.allergens && product.allergens.length > 0 ? (
                  <p>
                    <span className="font-semibold text-cocoa-900">
                      Contém{storeConfig.demoMode ? ' (informação de exemplo)' : ''}:
                    </span>{' '}
                    {product.allergens.join(', ')}.
                  </p>
                ) : (
                  <p>Informação de alergénios por confirmar para este produto.</p>
                )}
                {product.allergenNote && <p>{product.allergenNote}</p>}
                <p className="text-cocoa-500">
                  {storeConfig.allergenDisclaimer}{' '}
                  <Link to="/informacoes/alergenios" className="font-medium text-brand-700 underline-offset-4 hover:underline">
                    Saber mais
                  </Link>
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="relacionados">
          <div id="relacionados">
            <SectionHeading
              title="Também pode gostar"
              action={
                <ButtonLink to={`/loja?categoria=${product.categoryId}`} variant="outline" size="sm">
                  Ver categoria
                </ButtonLink>
              }
            />
          </div>
          <div className="mt-6">
            <ProductGrid products={related} columns="wide" />
          </div>
        </section>
      )}
    </div>
  )
}
