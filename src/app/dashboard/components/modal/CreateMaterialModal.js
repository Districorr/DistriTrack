// --- START OF FILE: src/app/dashboard/components/modal/CreateMaterialModal.js (FINAL AND CORRECTED) ---

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

export default function CreateMaterialModal({ isOpen, onClose, onSave, initialSearchTerm }) {
  const [newMaterial, setNewMaterial] = useState({ 
    code: '', 
    name: initialSearchTerm || '',
    brand: '', 
    specification: '' 
  });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // --- CORRECCIÓN CLAVE: Se reintroduce la cláusula de guarda ---
  // Si la prop 'isOpen' es false, el componente no debe renderizar NADA.
  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    if (!newMaterial.name) {
      toast.error('El nombre del material es obligatorio.');
      return;
    }
    setIsSaving(true);
    const { data, error } = await supabase.from('materials').insert([newMaterial]).select().single();
    setIsSaving(false);
    if (error) {
      toast.error(`Error al guardar el material: ${error.message}`);
    } else {
      toast.success('Material creado exitosamente.');
      onSave(data);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="fixed inset-0 bg-red bg-opacity-60 backdrop-blur-sm z-[60] flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <header className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Crear Nuevo Material</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código (opcional)</label>
              <input type="text" name="code" id="code" value={newMaterial.code} onChange={(e) => setNewMaterial({...newMaterial, code: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">* Nombre / Descripción</label>
              <input type="text" name="name" id="name" required value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca / Proveedor</label>
              <input type="text" name="brand" id="brand" value={newMaterial.brand} onChange={(e) => setNewMaterial({...newMaterial, brand: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="specification" className="block text-sm font-medium text-gray-700">Especificación</label>
              <input type="text" name="specification" id="specification" value={newMaterial.specification} onChange={(e) => setNewMaterial({...newMaterial, specification: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <footer className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400 transition-colors text-sm font-medium">{isSaving ? 'Guardando...' : 'Guardar y Asignar'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}