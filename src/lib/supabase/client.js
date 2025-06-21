// Importamos la función necesaria del paquete que instalamos.
import { createBrowserClient } from '@supabase/ssr'

// Esta función crea y devuelve un cliente de Supabase para usar en el navegador.
export function createClient() {
  return createBrowserClient(
    // Le pasamos la URL y la clave ANON que guardamos en el archivo .env.local
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}