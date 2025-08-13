// --- START OF FILE: src/lib/supabase/client.js (FULL AND CORRECTED) ---

import { createBrowserClient } from '@supabase/ssr'

// --- CORRECCIÓN: Implementación del patrón Singleton ---

// 1. Declaramos una variable 'client' fuera de la función.
//    Esta variable persistirá entre las recargas en caliente (Hot Reloads) en el entorno de desarrollo.
let client

// 2. Modificamos la función para que reutilice la instancia si ya existe.
export function createClient() {
  // Si la variable 'client' ya tiene una instancia, la devolvemos inmediatamente.
  if (client) {
    return client
  }

  // Si no existe una instancia, creamos una nueva y la guardamos en la variable 'client'.
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Devolvemos la instancia recién creada.
  return client
}