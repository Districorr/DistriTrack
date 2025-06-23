// --- START OF FILE: src/app/dashboard/SmartSearchBar.js (SIMPLIFIED AND FIXED) ---

'use client'

import { useState, useRef, useEffect } from 'react';

// --- El componente de tag ya no es necesario aquí, pero lo dejamos por si se reutiliza ---
const SearchTag = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="px-3 py-1.5 text-sm text-blue-100 bg-blue-900/60 rounded-full hover:bg-blue-900/90 transition-colors"
  >
    {text}
  </button>
);

// --- MODIFICADO: Se elimina la prop 'onSearchChange' y toda la lógica de parseo ---
export default function SmartSearchBar({ searchQuery, setSearchQuery }) {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleTagClick = (tag) => {
    setSearchQuery(prev => `${prev} ${tag}`.trim());
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar por paciente, médico, material..."
          className="w-full pl-4 pr-10 py-2.5 bg-white/10 text-white rounded-lg placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
        </div>
      </div>

      {/* El panel de sugerencias puede seguir existiendo para guiar al usuario */}
      {isFocused && (
        <div className="absolute top-full mt-2 w-full bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-blue-200 mb-3">Sugerencias de Búsqueda</h3>
          <p className="text-xs text-blue-300">Usa la búsqueda para un filtro rápido o el botón "Filtros" para opciones avanzadas.</p>
        </div>
      )}
    </div>
  );
}