/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** 'firestore' para ler produtos/categorias do Firestore; 'local' (padrão) para usar src/data */
  readonly VITE_CATALOG_SOURCE?: string
  /** 'false' para não guardar pedidos no Firestore */
  readonly VITE_SAVE_ORDERS?: string
  /** Só para desenvolvimento: 'localhost:8080' liga ao emulador do Firestore */
  readonly VITE_FIRESTORE_EMULATOR_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
