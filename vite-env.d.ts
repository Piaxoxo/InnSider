/// <reference types="vite/client" />

/**
 * Die Adresse der fremden Speisekarte — siehe .env.example und
 * src/lib/useMenuFeed.ts. Hier ausgeschrieben, damit ein Tippfehler im Namen
 * beim Übersetzen auffällt und nicht erst daran, dass die Seite still beim
 * eigenen Stand bleibt.
 */
interface ImportMetaEnv {
  readonly VITE_MENU_FEED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
