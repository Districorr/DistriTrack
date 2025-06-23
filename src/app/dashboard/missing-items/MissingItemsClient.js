// --- START OF FILE: src/app/dashboard/missing-items/MissingItemsClient.js ---

'use client'

import { useState, useMemo } from 'react';

export default function MissingItemsClient({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowercasedTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.materials.name.toLowerCase().includes(lowercasedTerm) ||
      item.materials.code?.toLowerCase().includes(lowercasedTerm) ||
      item.surgeries.patient_name?.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, items]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar material, paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Faltante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido (Paciente)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Cirugía</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.materials.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.materials.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{item.quantity_requested}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.surgeries.patient_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.surgeries.surgery_date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">No hay materiales marcados como faltantes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}