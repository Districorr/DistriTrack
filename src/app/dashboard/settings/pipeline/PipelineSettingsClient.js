// --- START OF FILE: src/app/dashboard/PipelineSettingsModal.js ---

'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button type="button" className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} onClick={onChange}>
    <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
  </button>
);

export default function PipelineSettingsModal({ initialStatuses, isOpen, onClose }) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // Sincroniza el estado si los datos iniciales cambian
  useEffect(() => {
    setStatuses(initialStatuses);
  }, [initialStatuses]);

  if (!isOpen) return null;

  const handleStatusChange = (id, field, value) => {
    setStatuses(prev => prev.map(status => status.id === id ? { ...status, [field]: value } : status));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatePromises = statuses.map(status =>
        supabase.from('pipeline_statuses').update({ name: status.name, color: status.color, is_visible: status.is_visible }).eq('id', status.id)
      );
      await Promise.all(updatePromises);
      alert('¡Ajustes guardados con éxito! La página se recargará para aplicar los cambios.');
      window.location.reload(); // Recargamos para que el pipeline principal se actualice
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // Contenedor del modal: fondo semitransparente y centrado
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity">
      {/* Panel del modal: más compacto y con botón de cierre */}
      <div className="relative bg-white p-5 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        {/* Botón de Cierre "X" */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajustes del Pipeline</h2>
          <p className="mt-1 text-sm text-gray-600">Personaliza los estados de tu pipeline.</p>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {statuses.map(status => (
            <div key={status.id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center">
              <div className="md:col-span-5">
                <input type="text" value={status.name} onChange={(e) => handleStatusChange(status.id, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="md:col-span-3 flex items-center gap-2">
                <input type="color" value={status.color} onChange={(e) => handleStatusChange(status.id, 'color', e.target.value)} className="h-8 w-8 p-0 border-none cursor-pointer rounded-md" />
                <span className="font-mono text-sm">{status.color}</span>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <ToggleSwitch enabled={status.is_visible} onChange={() => handleStatusChange(status.id, 'is_visible', !status.is_visible)} />
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