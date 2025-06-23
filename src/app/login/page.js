// --- START OF FILE: Login Page (SMART REDIRECT & RESPONSIVE) ---

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// --- Componente que contiene la lógica y la UI ---
function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams() // Hook para leer parámetros
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Credenciales inválidas. Por favor, intente de nuevo.')
      } else {
        // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---
        // 1. Leemos el parámetro 'redirect_to' que nos envió el middleware.
        const redirectToParam = searchParams.get('redirect_to')
        
        // 2. Si existe, decodificamos la URL y redirigimos allí.
        if (redirectToParam) {
          const redirectTo = decodeURIComponent(redirectToParam);
          router.push(redirectTo)
        } else {
          // 3. Si no existe, redirigimos al dashboard como siempre.
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (e) {
      setError('Ocurrió un error inesperado. Intente más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="relative mx-auto w-full max-w-4xl flex rounded-xl shadow-2xl overflow-hidden">
        
        {/* --- Columna Izquierda: Branding (se oculta en móviles) --- */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 text-white" style={{ backgroundColor: '#1E3A8A' }}>
          <h1 className="text-4xl font-bold tracking-wider">DistriTrack</h1>
          <p className="mt-4 text-center text-blue-200">Gestión y trazabilidad de pedidos simplificada.</p>
        </div>

        {/* --- Columna Derecha: Formulario (ocupa todo el ancho en móviles) --- */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
            {error && (
              <div className="p-3 text-center text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center px-4 py-3 font-semibold text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70"
                style={{ backgroundColor: '#1E3A8A' }}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// --- Componente de página que usa Suspense ---
// Suspense es necesario porque useSearchParams puede suspender el renderizado.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
