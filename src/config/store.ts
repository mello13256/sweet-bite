/**
 * ============================================================================
 *  CONFIGURAÇÃO DA LOJA — edite este ficheiro para personalizar o site.
 * ============================================================================
 *
 *  Tudo o que diz respeito ao negócio está aqui: nome, logótipo, cores,
 *  WhatsApp, contactos, redes sociais, horário, entregas e textos legais.
 *
 *  Os produtos e as categorias estão em src/data/ (ou no Firestore, se ativar
 *  o Firebase — ver README).
 *
 *  Campos vazios ('') ou null são tratados como "por configurar" e não são
 *  apresentados como se estivessem a funcionar.
 */

export const storeConfig = {
  /** Mostra uma faixa no topo a indicar que os conteúdos são demonstrativos. */
  demoMode: true,

  name: 'SweetBite',
  tagline: 'Doces que fazem sorrir',
  description:
    'Loja de doces: chocolates, gomas, rebuçados, bolachas, marshmallows, caixas de oferta e combos. Encomende online e levante na loja ou receba em casa.',

  /**
   * Logótipo. Se definir `image` (ex.: '/logo.svg' colocado na pasta public/),
   * a imagem substitui o logótipo em texto.
   */
  logo: {
    image: '' as string,
    alt: 'SweetBite — início',
  },

  /**
   * Cores da marca. Os valores são aplicados como variáveis CSS ao arrancar
   * (ver src/index.css para a lista completa e os valores por omissão).
   */
  colors: {
    'brand-50': '#fdf2f5',
    'brand-100': '#fbe4eb',
    'brand-200': '#f6c6d4',
    'brand-500': '#d63d6c',
    'brand-600': '#bf2c5a',
    'brand-700': '#9e2249',
    'cocoa-900': '#3b2420',
    'cocoa-700': '#5c3d36',
    'cream-50': '#fffaf6',
    'cream-100': '#fbf2ec',
  },

  /**
   * WhatsApp para receção de encomendas.
   * Formato internacional, só dígitos, sem "+" nem espaços. Ex.: '3519XXXXXXXX'.
   * Também pode ser definido pela variável de ambiente VITE_WHATSAPP_NUMBER.
   * Se ficar vazio, o botão de envio fica desativado com uma mensagem clara.
   */
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '',

  contact: {
    /** Telefone apresentado no site, ex.: '+351 2XX XXX XXX'. Vazio = por configurar. */
    phone: '',
    email: '',
    /** Morada da loja física. Vazio = por configurar. */
    address: '',
    /** Link opcional para o Google Maps */
    mapsUrl: '',
  },

  /** Redes sociais — deixe o URL vazio para esconder. */
  social: [
    { network: 'instagram', label: 'Instagram', url: '' },
    { network: 'facebook', label: 'Facebook', url: '' },
    { network: 'tiktok', label: 'TikTok', url: '' },
  ] as { network: 'instagram' | 'facebook' | 'tiktok' | 'youtube'; label: string; url: string }[],

  /** Horário de funcionamento (exemplo — substituir pelo horário real). */
  openingHours: [
    { days: 'Segunda a sexta', hours: '10h00 – 19h00' },
    { days: 'Sábado', hours: '10h00 – 13h00' },
    { days: 'Domingo e feriados', hours: 'Encerrado' },
  ],

  delivery: {
    pickupEnabled: true,
    deliveryEnabled: true,
    pickupDescription: 'Levante a sua encomenda na loja, no horário combinado.',
    deliveryDescription: 'Entrega ao domicílio na zona de entrega da loja.',
    /** Zonas onde a loja entrega (texto livre). */
    deliveryArea: 'Zona de entrega a definir pela loja.',
    /**
     * Custo de entrega em cêntimos. null = "a combinar" (não é somado ao total).
     * Ex.: 350 para 3,50 €.
     */
    deliveryFee: null as number | null,
    /** Entrega gratuita a partir deste subtotal (cêntimos). null = desativado. */
    freeDeliveryFrom: null as number | null,
  },

  cart: {
    /** Quantidade máxima por linha do carrinho */
    maxQuantityPerItem: 20,
    storageKey: 'sweetbite:cart:v1',
  },

  catalog: {
    pageSize: 12,
  },

  /** Promoções globais. Os descontos de cada produto estão em src/data/products.ts. */
  promotions: {
    enabled: true,
    bannerTitle: 'Promoções da semana',
    bannerText: 'Descontos selecionados em gomas, chocolates e caixas de oferta, enquanto durarem as existências.',
  },

  allergenDisclaimer:
    'A informação sobre alergénios apresentada neste site é indicativa e deve ser confirmada na rotulagem de cada produto. Em caso de alergia ou intolerância, contacte-nos antes de encomendar.',
}

export type StoreConfig = typeof storeConfig
