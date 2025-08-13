// --- START OF FILE: src/app/dashboard/SettingsMenu.js (FULL AND CORRECTED) ---

'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

// --- Iconos para el menú ---
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>;
// --- CORRECCIÓN: Nuevo icono para Proveedores ---
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path fillRule="evenodd" d="M3 4a2 2 0 00-2 2v5.5a1.5 1.5 0 001.5 1.5h1.5v-1.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v1.5h1.5a1.5 1.5 0 001.5-1.5V6a2 2 0 00-2-2H3zm14.5 9.5a1.5 1.5 0 00-1.5-1.5h-1.5v1.5a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-1.5H6a3 3 0 00-3 3v1a1 1 0 001 1h12a1 1 0 001-1v-1a3 3 0 00-3-3z" clipRule="evenodd" /></svg>;


export default function SettingsMenu({ profile, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleOpenSettingsClick = () => {
    onOpenSettings();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-blue-200 hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-colors"
        aria-label="Abrir menú de acciones"
      >
        <MenuIcon />
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-md shadow-2xl z-50 ring-1 ring-black ring-opacity-5
                   transition-all duration-200 ease-out
                   ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="p-2">
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Vista de Estados (Pipeline)
            </Link>
            <Link href="/dashboard/list" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Vista de Lista
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/dashboard/missing-items" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Materiales Faltantes
              </Link>
            )}
          </div>

          {profile?.role === 'admin' && (
            <div className="py-2 border-t border-gray-200 space-y-1">
              <Link href="/dashboard/materials-summary" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <SummaryIcon />
                Resumen de Materiales
              </Link>
              {/* --- CORRECCIÓN: Nuevo enlace a la página de Proveedores --- */}
              <Link href="/dashboard/settings/providers" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                <TruckIcon />
                Administrar Proveedores
              </Link>
              <button onClick={handleOpenSettingsClick} className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
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