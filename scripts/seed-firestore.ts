/**
 * Copia os produtos e as categorias de src/data/ para o Firestore.
 *
 * Utilização:
 *   1. Consola do Firebase → Definições do projeto → Contas de serviço →
 *      "Gerar nova chave privada". Guarde o ficheiro JSON FORA do repositório
 *      (ou com o nome service-account.json, que está no .gitignore).
 *   2. GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed:firestore
 *
 *   Emulador local (sem credenciais):
 *     FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-sweetbite npm run seed:firestore
 *
 *   Opções:
 *     --dry-run   mostra o que seria escrito, sem escrever
 *     --prune     apaga do Firestore produtos/categorias que já não existem em src/data
 *
 * Os documentos usam o mesmo `id` dos ficheiros locais, por isso executar o
 * script várias vezes atualiza os dados em vez de os duplicar.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { categories } from '../src/data/categories'
import { products } from '../src/data/products'

const dryRun = process.argv.includes('--dry-run')
const prune = process.argv.includes('--prune')

async function main() {
  console.log(`${products.length} produtos e ${categories.length} categorias em src/data.`)
  if (dryRun) {
    console.log('Modo --dry-run: nada foi escrito.')
    return
  }
  // Com o emulador (FIRESTORE_EMULATOR_HOST) não são precisas credenciais.
  const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST
  if (!usingEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Defina GOOGLE_APPLICATION_CREDENTIALS com o caminho para a chave da conta de serviço.')
  }

  initializeApp(
    usingEmulator
      ? { projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-sweetbite' }
      : { credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID },
  )
  const db = getFirestore()
  db.settings({ ignoreUndefinedProperties: true })

  const batch = db.batch()
  for (const { id, ...data } of categories) batch.set(db.collection('categories').doc(id), data)
  for (const { id, ...data } of products) batch.set(db.collection('products').doc(id), data)

  if (prune) {
    const keep = { categories: new Set(categories.map((c) => c.id)), products: new Set(products.map((p) => p.id)) }
    for (const name of ['categories', 'products'] as const) {
      const snap = await db.collection(name).get()
      for (const doc of snap.docs) if (!keep[name].has(doc.id)) batch.delete(doc.ref)
    }
  }

  await batch.commit()
  console.log('Firestore atualizado com sucesso.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
