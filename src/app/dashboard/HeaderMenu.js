'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HeaderMenu({ userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón para abrir/cerrar el menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span>Menú</span>
        {/* La flecha ahora rota suavemente con la animación */}
        <svg className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* --- Panel del menú desplegable con ANIMACIONES --- */}
      <div
        className={`absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5
                   transition-all duration-200 ease-out
                   ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* 
          - 'origin-top-right': Asegura que la animación de escala empiece desde la esquina superior derecha.
          - 'transition-all duration-200 ease-out': Define la animación.
          - 'opacity-100 scale-100': Estado visible.
          - 'opacity-0 scale-95': Estado oculto (ligeramente más pequeño y transparente).
          - 'pointer-events-none': Evita que se pueda hacer clic en el menú cuando está invisible.
        */}
        <div className="py-1">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Vista de Estados
          </Link>
          <Link href="/dashboard/list" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Vista de Lista
          </Link>
          {userRole === 'admin' && (
            <Link href="/dashboard/missing-items" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Materiales Faltantes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}