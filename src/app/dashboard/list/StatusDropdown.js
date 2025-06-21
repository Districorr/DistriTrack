'use client'

import { useState, useEffect, useRef } from 'react'

export default function StatusDropdown({ currentStatus, allStatuses, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cierra el menú si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelect = (statusId) => {
    onStatusChange(statusId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      {/* Botón que muestra el estado actual y abre el menú */}
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: currentStatus?.color || '#CCCCCC' }}></span>
            {currentStatus?.name || 'Seleccionar...'}
          </span>
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Panel del menú desplegable con animación */}
      <div
        className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10
                   transition-all duration-150 ease-out
                   ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="py-1">
          {allStatuses.map(status => (
            <a
              key={status.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSelect(status.id);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: status.color }}></span>
              {status.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}