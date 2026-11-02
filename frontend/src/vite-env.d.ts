/// <reference types="vite/client" />

// Переменные окружения проекта. Значения приходят из frontend/.env.local;
// тип допускает отсутствие значения, поэтому код обязан проверять его до использования.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
