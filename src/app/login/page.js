// --- START OF FILE: Login Page (COMPLETELY REDESIGNED) ---

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// --- NUEVO: Icono del logo para la sección de branding ---
const LogoIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#FFFFFF"/>
    <path d="M12 6C11.45 6 11 6.45 11 7V17C11 17.55 11.45 18 12 18C12.55 18 13 17.55 13 17V7C13 6.45 12.55 6 12 6Z" fill="#FFFFFF"/>
    <path d="M8.5 8.5C8.22 8.5 8 8.72 8 9V15C8 15.28 8.22 15.5 8.5 15.5C8.78 15.5 9 15.28 9 15V9C9 8.72 8.78 8.5 8.5 8.5Z" fill="#FFFFFF"/>
    <path d="M15.5 8.5C15.22 8.5 15 8.72 15 9V15C15 15.28 15.22 15.5 15.5 15.5C15.78 15.5 16 15.28 16 15V9C16 8.72 15.78 8.5 15.5 8.5Z" fill="#FFFFFF"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  // --- NUEVO: Estado para controlar la carga del botón ---
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true) // Inicia la carga

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Credenciales inválidas. Por favor, intente de nuevo.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (e) {
      setError('Ocurrió un error inesperado. Intente más tarde.')
    } finally {
      setIsLoading(false) // Finaliza la carga, sin importar el resultado
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="relative mx-auto w-full max-w-4xl flex rounded-xl shadow-2xl overflow-hidden">
        
        {/* --- Columna Izquierda: Branding --- */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 text-white" style={{ backgroundColor: '#1E3A8A' }}>
          <h1 className="text-4xl font-bold tracking-wider">DistriTrack</h1>
          <p className="mt-4 text-center text-blue-200">Gestión y trazabilidad de pedidos simplificada.</p>
        </div>

        {/* --- Columna Derecha: Formulario --- */}
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
                // --- MEJORADO: Se añade text-gray-900 para asegurar letra negra ---
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
                // --- MEJORADO: Se añade text-gray-900 para asegurar letra negra ---
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
                // --- MEJORADO: Estilos del botón con el color corporativo y estado de carga ---
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