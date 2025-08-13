// --- START OF FILE: src/app/dashboard/PipelineSettingsModal.js (WITH DISPLAY LIMIT) ---

'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HelpCircle } from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button type="button" className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} onClick={onChange}>
    <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
  </button>
);

export default function PipelineSettingsModal({ initialStatuses, isOpen, onClose }) {
  const [statuses, setStatuses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [show, setShow] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const statusesWithDefaults = initialStatuses.map(s => ({
      ...s,
      name: s.name ?? '',
      color: s.color ?? '#cccccc',
      is_visible: s.is_visible ?? true,
      requires_purchase_order: s.requires_purchase_order ?? false,
      display_limit: s.display_limit ?? null // Se añade el nuevo campo
    }));
    setStatuses(statusesWithDefaults);
  }, [initialStatuses]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleStatusChange = (id, field, value) => {
    // Para el límite, si el valor es vacío o no numérico, lo guardamos como null
    if (field === 'display_limit') {
        const numValue = parseInt(value, 10);
        value = isNaN(numValue) ? null : numValue;
    }
    setStatuses(prev => prev.map(status => status.id === id ? { ...status, [field]: value } : status));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // --- CORRECCIÓN: Se añade 'display_limit' a la actualización ---
      const updatePromises = statuses.map(status =>
        supabase.from('pipeline_statuses').update({ 
          name: status.name, 
          color: status.color, 
          is_visible: status.is_visible,
          requires_purchase_order: status.requires_purchase_order,
          display_limit: status.display_limit
        }).eq('id', status.id)
      );
      await Promise.all(updatePromises);
      alert('¡Ajustes guardados con éxito! La página se recargará para aplicar los cambios.');
      window.location.reload();
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white p-5 rounded-lg shadow-xl w-full max-w-4xl transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajustes del Pipeline</h2>
          <p className="mt-1 text-sm text-gray-600">Personaliza los nombres, colores y comportamientos de cada estado.</p>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-3">Nombre del Estado</div>
            <div className="col-span-2">Color</div>
            <div className="col-span-3">¿Requiere N° OC?</div>
            <div className="col-span-2">Límite Tarjetas</div>
            <div className="col-span-2 text-right">Visible</div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 mt-2">
          {statuses.map(status => (
            <div key={status.id} className="grid grid-cols-12 gap-4 items-center p-2 rounded-md hover:bg-gray-50">
              <div className="col-span-12 md:col-span-3">
                <input type="text" value={status.name ?? ''} onChange={(e) => handleStatusChange(status.id, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900" />
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                <input type="color" value={status.color ?? '#cccccc'} onChange={(e) => handleStatusChange(status.id, 'color', e.target.value)} className="h-8 w-8 p-0 border-none cursor-pointer rounded-md" />
                <span className="font-mono text-sm text-gray-900">{status.color ?? ''}</span>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`requires_oc_${status.id}`}
                  checked={status.requires_purchase_order ?? false}
                  onChange={(e) => handleStatusChange(status.id, 'requires_purchase_order', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`requires_oc_${status.id}`} className="text-sm text-gray-700">Sí</label>
              </div>
              {/* --- CORRECCIÓN: Nuevo campo para el límite de visualización --- */}
              <div className="col-span-6 md:col-span-2">
                <input 
                    type="number"
                    value={status.display_limit ?? ''}
                    onChange={(e) => handleStatusChange(status.id, 'display_limit', e.target.value)}
                    placeholder="Todos"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                    min="1"
                />
              </div>
              <div className="col-span-6 md:col-span-2 flex justify-end">
                <ToggleSwitch enabled={status.is_visible ?? true} onChange={() => handleStatusChange(status.id, 'is_visible', !status.is_visible)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button onClick={handleSaveChanges} disabled={isSaving} className="px-5 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}