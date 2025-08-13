// --- START OF FILE: src/app/dashboard/UserMenu.js (MODIFIED) ---

'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>);

// --- MODIFICADO: Ahora recibe 'onOpenSettings' ---
export default function UserMenu({ user, userRole, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) { if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleOpenSettingsClick = () => {
    onOpenSettings();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-blue-900/50 px-3 py-2 rounded-md hover:bg-blue-900/80 transition-colors">
        <span className="text-blue-200 text-sm font-medium">{user?.email || 'Usuario'}</span>
        <svg className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      <div className={`absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-md shadow-2xl z-50 ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-2">
          <div className="px-2 py-2 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole || 'Rol'}</p>
          </div>
          <div className="mt-2 py-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Vista de Estados (Pipeline)</Link>
            <Link href="/dashboard/list" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Vista de Lista</Link>
            {userRole === 'admin' && (<Link href="/dashboard/missing-items" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Materiales Faltantes</Link>)}
          </div>
          {userRole === 'admin' && (
            <div className="py-1 border-t border-gray-200">
              {/* --- MODIFICADO: Ahora es un botón que llama a una función --- */}
              <button onClick={handleOpenSettingsClick} className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <SettingsIcon />
                Ajustes del Pipeline
              </button>
            </div>
          )}
          <div className="mt-1 pt-2 border-t border-gray-200">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}