/**
 * Ligação ao Firebase (opcional).
 *
 * O site funciona sem Firebase, usando os dados de src/data/. Quando as
 * variáveis VITE_FIREBASE_* estão definidas (ver .env.example):
 *  - os pedidos de encomenda passam a ser guardados na coleção "orders"
 *    do Firestore antes de abrir o WhatsApp (VITE_SAVE_ORDERS=false desativa);
 *  - com VITE_CATALOG_SOURCE=firestore, os produtos e as categorias são lidos
 *    das coleções "products" e "categories".
 *
 * O SDK do Firebase só é descarregado quando é realmente necessário
 * (import dinâmico), para não pesar no carregamento inicial.
 */
import type { Firestore } from 'firebase/firestore'

const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

export const catalogSource: 'firestore' | 'local' =
  isFirebaseConfigured && env.VITE_CATALOG_SOURCE === 'firestore' ? 'firestore' : 'local'

export const saveOrdersEnabled = isFirebaseConfigured && env.VITE_SAVE_ORDERS !== 'false'

let dbPromise: Promise<Firestore> | null = null

export function getDb(): Promise<Firestore> {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não está configurado.'))
  dbPromise ??= (async () => {
    const [{ initializeApp, getApps }, { initializeFirestore, getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ])
    const existing = getApps()[0]
    if (existing) return getFirestore(existing)
    const app = initializeApp(firebaseConfig)
    const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
    // Desenvolvimento: VITE_FIRESTORE_EMULATOR_HOST=localhost:8080 usa o emulador local.
    const emulator = env.VITE_FIRESTORE_EMULATOR_HOST
    if (emulator) {
      const { connectFirestoreEmulator } = await import('firebase/firestore')
      const [host, port] = emulator.split(':')
      connectFirestoreEmulator(db, host ?? 'localhost', Number(port ?? 8080))
    }
    return db
  })()
  return dbPromise
}
