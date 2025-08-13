// --- START OF FILE: src/app/dashboard/PurchaseOrderModal.js (FINAL FIX) ---

'use client';

import { useState } from 'react';

export default function PurchaseOrderModal({ isOpen, onClose, onSubmit, statusName }) {
  const [poNumber, setPoNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (poNumber.trim()) {
      onSubmit(poNumber.trim());
    } else {
      alert('Debe ingresar un Número de Orden de Compra.');
    }
  };

  return (
    <div className="fixed inset-0 bg-red bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">Acción Requerida</h3>
          <p className="mt-2 text-sm text-gray-600">
            Para mover el pedido al estado <span className="font-semibold">"{statusName}"</span>, por favor, ingrese el Número de Orden de Compra (OC).
          </p>
          <form onSubmit={handleSubmit} className="mt-4">
            <label htmlFor="po_number" className="block text-sm font-medium text-gray-700">N° de Orden de Compra</label>
            <input
              type="text"
              id="po_number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              // --- CORRECCIÓN CLAVE: Se añade 'text-gray-900' ---
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              required
              autoFocus
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Confirmar y Mover
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}