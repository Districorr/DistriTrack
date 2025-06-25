// --- START OF FILE: src/app/dashboard/MobileSearchModal.js ---

'use client'

import { useState, useEffect } from 'react';

export default function MobileSearchModal({ isOpen, onClose, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Cuando el modal se cierra, limpiamos la búsqueda
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-start pt-20 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, médico, material..."
            className="w-full p-4 border-0 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
