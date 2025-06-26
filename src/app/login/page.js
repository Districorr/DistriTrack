'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import TrakOwl from './TrakOwl'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formState, setFormState] = useState('idle')
  const [errorCount, setErrorCount] = useState(0); // <-- NUEVO: Contador de errores

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormState('loading')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setFormState('error')
      setErrorCount(prev => prev + 1); // <-- NUEVO: Incrementamos el contador
      setTimeout(() => setFormState('idle'), 2000) // Damos más tiempo para la animación de error
    } else {
      setErrorCount(0); // Reseteamos al iniciar sesión con éxito
      const redirectToParam = searchParams.get('redirect_to')
      if (redirectToParam) {
        router.push(decodeURIComponent(redirectToParam))
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-800 to-sky-400 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex justify-center">
          <TrakOwl 
            state={formState} 
            isPasswordVisible={showPassword}
            emailLength={email.length}
            passwordLength={password.length}
            errorCount={errorCount} // <-- NUEVO: Pasamos el contador como prop
          />
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Bienvenido de Vuelta</h1>
          <p className="text-center text-gray-600 mb-8">Accede a tu cuenta de DistriTrack.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Correo Electrónico"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFormState('emailFocus')}
                onBlur={() => setFormState('idle')}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-blue-600 focus:border-blue-600 focus:outline-none text-gray-900 transition"
              />
            </div>
            
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFormState('passwordFocus')}
                onBlur={() => setFormState('idle')}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:ring-blue-600 focus:border-blue-600 focus:outline-none text-gray-900 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
              </button>
            </div>

            {formState === 'error' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="text-center text-sm font-medium text-red-600"
              >
                Credenciales incorrectas. Por favor, verifica tus datos.
              </motion.div>
            )}

            <div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={formState === 'loading'}
                className="w-full px-4 py-3 font-bold text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors disabled:bg-blue-400"
              >
                {formState === 'loading' ? 'Ingresando...' : 'Iniciar Sesión'}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-blue-700 hover:text-blue-600">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-800 to-sky-400">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}