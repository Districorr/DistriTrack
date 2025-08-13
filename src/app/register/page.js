// --- START OF FILE: src/app/register/page.js ---

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Primero, intentamos registrar al usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Aquí pasamos los datos adicionales que nuestro trigger usará
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) {
      console.error('Error de registro:', authError.message)
      if (authError.message.includes('User already registered')) {
        setError('Este correo electrónico ya está registrado.')
      } else {
        setError('No se pudo completar el registro. Intente de nuevo.')
      }
      setIsLoading(false)
      return
    }

    // Si el registro en Auth es exitoso pero no se crea el usuario (ej: email de confirmación requerido)
    if (!authData.user) {
        alert('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.')
        router.push('/login')
        return
    }

    // Si el registro es exitoso y el usuario se crea al instante
    alert('¡Registro completado! Serás redirigido al dashboard.')
    router.push('/dashboard')
    router.refresh()
    
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="relative mx-auto w-full max-w-md p-8 sm:p-12 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Crear una Cuenta
        </h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
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
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
             <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
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
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
