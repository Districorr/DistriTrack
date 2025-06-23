// --- START OF FILE: src/middleware.js (MODIFIED FOR SMART REDIRECT) ---

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options, })
          response = NextResponse.next({ request: { headers: request.headers, }, })
          response.cookies.set({ name, value, ...options, })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options, })
          response = NextResponse.next({ request: { headers: request.headers, }, })
          response.cookies.set({ name, value: '', ...options, })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname, search } = request.nextUrl;

  // --- LÓGICA DE REDIRECCIÓN MEJORADA ---

  // Si el usuario no está logueado y no está en la página de login
  if (!session && pathname !== '/login') {
    // 1. Construimos la URL a la que el usuario quería ir.
    // Incluye la ruta y todos los parámetros de búsqueda (ej: /dashboard/new-surgery?patient_name=...)
    const redirectTo = pathname + search;

    // 2. Creamos la URL de login y le añadimos la URL original como un parámetro.
    // Usamos encodeURIComponent para asegurar que caracteres especiales como '?' y '&' no rompan la URL.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', encodeURIComponent(redirectTo));
    
    // 3. Redirigimos al usuario a la página de login con la información guardada.
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está logueado y está en la página de login, redirigir al dashboard
  // (Esta lógica no cambia)
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Configuración para que el middleware se aplique a todas las rutas excepto las de sistema.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
