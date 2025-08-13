// --- START OF FILE: src/app/dashboard/MobileSearchModal.js (FULL AND REFINED) ---

'use client'

import { useState, useEffect } from 'react';

// --- Icono de Lupa para el botón de búsqueda ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function MobileSearchModal({ isOpen, onClose, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  // --- NUEVO: Estado para controlar las animaciones ---
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [isOpen]);

  // Limpia el término de búsqueda cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setSearchTerm(''), 300); // Espera a que la animación termine
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    handleClose();
  };

  // No renderizar nada si no está abierto
  if (!isOpen) return null;

  return (
    // --- MEJORADO: Contenedor con fondo desenfocado y animación de opacidad ---
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-start pt-20 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      {/* --- MEJORADO: Panel con animación de escala y nuevo diseño --- */}
      <div 
        className={`relative bg-white/90 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, médico, material..."
            className="w-full p-4 pl-5 pr-14 border-0 bg-transparent rounded-xl text-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            autoFocus
          />
          <button 
            type="submit" 
            className="absolute inset-y-0 right-0 flex items-center justify-center w-14 text-indigo-600 hover:text-indigo-800"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
