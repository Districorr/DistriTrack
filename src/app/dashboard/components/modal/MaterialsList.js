// --- START OF FILE: src/app/dashboard/components/modal/MaterialsList.js (FULL AND CORRECTED) ---

'use client';

import { useState } from 'react';
// --- CORRECCIÓN: Importamos el nuevo modal ---
import AssignCodeModal from './AssignCodeModal';

export default function MaterialsList({ materials, onUpdate, userRole }) {
  // --- CORRECCIÓN: Estado para controlar el modal de asignación ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // --- CORRECCIÓN: Lógica para abrir el modal ---
  const handleOpenAssignModal = (material) => {
    setSelectedMaterial(material);
    setIsAssignModalOpen(true);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-bold text-gray-800 mb-4">Materiales Solicitados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-2">Material</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Observaciones</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.length > 0 ? materials.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    {item.materials ? (
                      <div>
                        <p className="font-medium text-gray-900">{item.materials.name}</p>
                        <p className="text-gray-500 text-xs">{item.materials.code}</p>
                      </div>
                    ) : (
                      <div className="font-medium text-orange-600">
                        <p>{item.free_text_description}</p>
                        <p className="text-xs font-normal">(Provisorio)</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.quantity_requested}</td>
                  <td className="px-4 py-3 text-gray-700">{item.observations || '-'}</td>
                  <td className="px-4 py-3">
                    {!item.material_id && userRole === 'admin' && (
                      <button
                        // --- CORRECCIÓN: Conectamos la nueva función ---
                        onClick={() => handleOpenAssignModal(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
                      >
                        Asignar Código
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">No hay materiales solicitados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CORRECCIÓN: Renderizado condicional del nuevo modal --- */}
      {isAssignModalOpen && (
        <AssignCodeModal
          surgeryMaterial={selectedMaterial}
          onClose={() => setIsAssignModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}