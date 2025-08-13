// --- START OF FILE: src/app/dashboard/components/modal/AssignCodeModal.js (ESLINT FIX) ---

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { X, Search, PlusCircle } from 'lucide-react';

import CreateMaterialModal from './CreateMaterialModal';

export default function AssignCodeModal({ surgeryMaterial, onClose, onUpdate }) {
  const supabase = createClientComponentClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults([]);
      return;
    }

    const fetchMaterials = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, code, brand')
        .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (data) setResults(data);
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchMaterials();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, supabase]);

  const handleAssign = async (materialId) => {
    setIsSaving(true);
    const { error } = await supabase.rpc('assign_material_to_provisional_item', {
        p_surgery_material_id: surgeryMaterial.id,
        p_material_id: materialId
    });

    if (error) {
        toast.error("Error al asignar el material: " + error.message);
    } else {
        toast.success("Material asignado correctamente.");
        onUpdate();
        onClose();
    }
    setIsSaving(false);
  };

  const handleMaterialCreated = (newMaterial) => {
    handleAssign(newMaterial.id);
  };

  return (
    <>
      <div className="fixed inset-0 bg-red bg-opacity-60 backdrop-blur-sm flex justify-center items-start z-50 pt-20 px-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
          <header className="p-4 border-b flex justify-between items-center">
            {/* --- CORRECCIÓN CLAVE: Se reemplazan las comillas dobles --- */}
            <h3 className="font-bold text-gray-800">Asignar Código a &quot;{surgeryMaterial.free_text_description}&quot;</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
          </header>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto">
              {isLoading && <p className="text-center text-gray-500 py-4">Buscando...</p>}
              {results.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {results.map((material) => (
                    <li key={material.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                      <div>
                        <p className="font-semibold text-gray-900">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.code} - {material.brand}</p>
                      </div>
                      <button 
                          onClick={() => handleAssign(material.id)}
                          disabled={isSaving}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 disabled:bg-green-300"
                      >
                        {isSaving ? '...' : 'Asignar'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!isLoading && searchTerm.length >= 3 && results.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">No se encontraron resultados para &quot;{searchTerm}&quot;.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 text-sm"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Crear Nuevo Artículo
                  </button>
                </div>
              )}
            </div>
          </div>
          <footer className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 text-sm"
            >
              <PlusCircle size={16} className="mr-2" />
              Crear Nuevo Artículo
            </button>
          </footer>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateMaterialModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleMaterialCreated}
          initialSearchTerm={searchTerm}
        />
      )}
    </>
  );
}
