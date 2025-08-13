// --- START OF FILE: src/middleware.js (FULL, VERIFIED, AND WITH ROOT REDIRECT) ---

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Inicializamos una respuesta base que permite que la petición continúe.
  // La modificaremos si es necesario redirigir.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Creamos un cliente de Supabase que puede operar en el servidor (middleware).
  // Este cliente necesita acceso a las cookies para gestionar la sesión del usuario.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Si la sesión se refresca, el middleware actualiza las cookies en la petición y en la respuesta.
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // Si el usuario cierra sesión, el middleware elimina la cookie.
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Obtenemos la sesión actual del usuario.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Obtenemos la ruta y los parámetros de la URL solicitada.
  const { pathname, search } = request.nextUrl;

  // --- NUEVO: Regla para la página de inicio (ruta raíz) ---
  // Esta regla se ejecuta primero para manejar el caso especial de la página principal.
  if (pathname === '/') {
    if (session) {
      // Si hay sesión, redirigir al dashboard.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Si no hay sesión, redirigir al login.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- Lógica de Redirección Existente ---
  const publicRoutes = ['/login', '/register'];

  // 1. Si el usuario NO tiene una sesión activa Y la ruta a la que intenta acceder NO es pública...
  if (!session && !publicRoutes.includes(pathname)) {
    // Guardamos la URL completa a la que quería ir.
    const redirectTo = pathname + search;
    
    // Creamos la URL de login y le añadimos la URL guardada como un parámetro.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', encodeURIComponent(redirectTo));
    
    // Redirigimos al usuario a la página de login.
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si el usuario SÍ tiene una sesión activa Y está intentando acceder a una página pública (login o registro)...
  if (session && publicRoutes.includes(pathname)) {
    // Lo redirigimos a la página principal del dashboard para evitar que vea el login/registro de nuevo.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Si ninguna de las condiciones anteriores se cumple, permitimos que la petición continúe normalmente.
  return response
}

// Configuración del Matcher:
// Esto le dice a Next.js en qué rutas debe ejecutarse el middleware.
// La expresión regular excluye archivos estáticos, imágenes, etc., para optimizar el rendimiento.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
