// --- START OF FILE: src/app/dashboard/FilterModal.js (FIXED UNIQUE KEY ERROR) ---

'use client'

import { useState, useEffect } from 'react';
import AutocompleteSelect from './AutocompleteSelect';

// --- Componente de Ayuda para un campo de filtro ---
const FilterField = ({ label, children }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <label className="text-sm font-medium text-gray-700 text-right col-span-1">{label}</label>
    <div className="col-span-2">
      {children}
    </div>
  </div>
);

const ClearIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);

export default function FilterModal({ isOpen, onClose, options, onApply, activeFilters }) {
  const [show, setShow] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters);
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [isOpen, activeFilters]);

  const handleClose = () => { setShow(false); setTimeout(onClose, 300); };
  const handleApply = () => { onApply(localFilters); handleClose(); };
  const handleClear = () => { setLocalFilters({}); };

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      if (value === '' || value === null || value === false) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={handleClose}>
      <div className={`relative bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filtros Avanzados</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-800" aria-label="Cerrar"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3">
          <FilterField label="Estado">
            <AutocompleteSelect items={options.statuses?.map(s => s.name) || []} selected={options.statuses?.find(s => s.id === localFilters.status)?.name || null} setSelected={(name) => handleFilterChange('status', options.statuses?.find(s => s.name === name)?.id || null)} placeholder="Buscar estado..." />
          </FilterField>
          <FilterField label="Médico">
            <AutocompleteSelect items={options.doctors || []} selected={localFilters.doctor || null} setSelected={(value) => handleFilterChange('doctor', value)} placeholder="Buscar médico..." />
          </FilterField>
          <FilterField label="Institución">
            <AutocompleteSelect items={options.institutions || []} selected={localFilters.institution || null} setSelected={(value) => handleFilterChange('institution', value)} placeholder="Buscar institución..." />
          </FilterField>
          <FilterField label="Creado por">
            <AutocompleteSelect items={options.creators?.map(c => c.full_name) || []} selected={options.creators?.find(c => c.id === localFilters.creator)?.full_name || null} setSelected={(name) => handleFilterChange('creator', options.creators?.find(c => c.full_name === name)?.id || null)} placeholder="Buscar creador..." />
          </FilterField>
          <FilterField label="Cliente">
            <AutocompleteSelect items={options.clients || []} selected={localFilters.client || null} setSelected={(value) => handleFilterChange('client', value)} placeholder="Buscar cliente..." />
          </FilterField>
          <FilterField label="Proveedor">
            <AutocompleteSelect items={options.providers || []} selected={localFilters.provider || null} setSelected={(value) => handleFilterChange('provider', value)} placeholder="Buscar proveedor..." />
          </FilterField>
          <FilterField label="Material Solicitado">
            {/* --- CORREGIDO: Usamos new Set() para asegurar que los nombres de los materiales sean únicos --- */}
            <AutocompleteSelect items={[...new Set(options.materials?.map(m => m.name) || [])]} selected={options.materials?.find(m => m.id === localFilters.material)?.name || null} setSelected={(name) => handleFilterChange('material', options.materials?.find(m => m.name === name)?.id || null)} placeholder="Buscar material..." />
          </FilterField>
          <FilterField label="Fecha de Cirugía">
            <input type="date" onChange={(e) => handleFilterChange('surgery_date', e.target.value)} value={localFilters.surgery_date || ''} className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900" />
          </FilterField>
          <FilterField label="Etiquetas de Estado">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-900"><input type="checkbox" onChange={(e) => handleFilterChange('is_urgent', e.target.checked)} checked={!!localFilters.is_urgent} /><span>Urgente</span></label>
              <label className="flex items-center space-x-2 text-sm text-gray-900"><input type="checkbox" onChange={(e) => handleFilterChange('is_rework', e.target.checked)} checked={!!localFilters.is_rework} /><span>Reproceso</span></label>
              <label className="flex items-center space-x-2 text-sm text-gray-900"><input type="checkbox" onChange={(e) => handleFilterChange('has_missing', e.target.checked)} checked={!!localFilters.has_missing} /><span>Faltantes</span></label>
            </div>
          </FilterField>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <button onClick={handleClear} className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"><ClearIcon />Limpiar Filtros</button>
          <button onClick={handleApply} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
}