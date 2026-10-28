import type { Category } from '../types'
import { pexels } from '../lib/images'

/**
 * Categorias da loja (dados de demonstração — edite à vontade).
 * O `id` aparece no URL do catálogo: /loja?categoria=<id>
 */
export const categories: Category[] = [
  {
    id: 'chocolates',
    name: 'Chocolates',
    description: 'Bombons, trufas, tabletes e drageias.',
    image: pexels(15550431),
    order: 1,
  },
  {
    id: 'gomas',
    name: 'Gomas',
    description: 'Ursinhos, minhocas, ácidas e misturas.',
    image: pexels(5469218),
    order: 2,
  },
  {
    id: 'rebucados',
    name: 'Rebuçados',
    description: 'Rebuçados de fruta, chupa-chupas e pastilhas.',
    image: pexels(36595764),
    order: 3,
  },
  {
    id: 'bolachas',
    name: 'Bolachas',
    description: 'Cookies, bolachas de manteiga e suspiros.',
    image: pexels(8081573),
    order: 4,
  },
  {
    id: 'marshmallows',
    name: 'Marshmallows',
    description: 'Fofos, coloridos e perfeitos para partilhar.',
    image: pexels(10049810),
    order: 5,
  },
  {
    id: 'importados',
    name: 'Doces importados',
    description: 'Macarons, nougat e outras especialidades.',
    image: pexels(8625947),
    order: 6,
  },
  {
    id: 'caixas-oferta',
    name: 'Caixas de oferta',
    description: 'Presentes prontos a oferecer.',
    image: pexels(14275701),
    order: 7,
  },
  {
    id: 'combos',
    name: 'Combos e promoções',
    description: 'Conjuntos pensados para festas e partilha.',
    image: pexels(7104470),
    order: 8,
  },
]
