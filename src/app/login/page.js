// Paso 1: Indicar que este es un "Componente de Cliente".
// Es necesario porque usaremos hooks de React (useState, useRouter) que interactúan con el usuario en el navegador.
'use client'

// Paso 2: Importar las herramientas que necesitamos.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client' // Nuestro cliente Supabase que creamos antes

// Paso 3: Definir el componente de la página de Login.
export default function LoginPage() {
  // Estados para guardar lo que el usuario escribe en los campos de email y contraseña.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null) // Estado para mostrar mensajes de error

  // El router nos permitirá redirigir al usuario a otra página después del login.
  const router = useRouter()
  
  // Creamos una instancia del cliente de Supabase.
  const supabase = createClient()

  // Esta función se ejecutará cuando el usuario envíe el formulario.
  const handleLogin = async (e) => {
    e.preventDefault() // Evita que la página se recargue al enviar el formulario.
    setError(null) // Limpiamos cualquier error anterior

    // Usamos el cliente de Supabase para intentar iniciar sesión.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Si Supabase devuelve un error, lo guardamos en el estado para mostrarlo.
      console.error('Error de login:', error.message)
      setError('Credenciales inválidas. Por favor, intente de nuevo.')
    } else {
      // Si el login es exitoso, redirigimos al usuario al dashboard principal.
      // Y forzamos un refresh para que el layout del servidor se actualice con la sesión del usuario.
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Paso 4: El HTML (JSX) que se mostrará en la pantalla.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Iniciar Sesión en DistriTrack
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {error && (
            <div className="p-3 text-center text-red-800 bg-red-100 border border-red-400 rounded-md">
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}