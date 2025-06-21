'use client'

import { useState } from 'react'
import StatusDropdown from './StatusDropdown' // Importamos nuestro nuevo componente

const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function SurgeryListItem({ surgery, allStatuses, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const firstMaterial = surgery.surgery_materials?.[0]?.materials;
  const currentStatus = surgery.status;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-2 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-1/3"><p className="font-bold text-gray-900">{firstMaterial?.name || 'Pedido sin material'}</p><p className="text-sm text-gray-600">{firstMaterial?.code}</p></div>
        <div className="w-1/4"><p className="text-sm font-medium text-gray-900">{surgery.patient_name}</p></div>
        <div className="w-1/4"><p className="text-sm text-gray-600">{surgery.institution}</p></div>
        <div className="w-1/6 text-center">
          <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: currentStatus?.color + '20', color: currentStatus?.color }}>{currentStatus?.name || 'N/A'}</span>
        </div>
        <div className="w-auto flex justify-end pl-4"><svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Detalles del Pedido</h4>
              <div className="space-y-1 text-sm">
                <p><strong className="font-medium text-gray-900">Médico:</strong> <span className="text-gray-700">{surgery.doctor_name}</span></p>
                <p><strong className="font-medium text-gray-900">Fecha CX:</strong> <span className="text-gray-700">{formatDate(surgery.surgery_date)}</span></p>
                <p><strong className="font-medium text-gray-900">Creado por:</strong> <span className="text-gray-700">{surgery.creator?.full_name}</span></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Materiales</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {surgery.surgery_materials.map(item => (
                  <li key={item.id} className="text-gray-700"><span className="font-medium text-gray-900">{item.quantity_requested}x</span> - {item.materials.name}</li>
                ))}
              </ul>
            </div>
            {/* --- CAMBIO: Usamos el nuevo componente StatusDropdown --- */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Acciones</h4>
              <label className="text-sm font-medium text-gray-900">Cambiar Estado:</label>
              <div className="mt-1">
                <StatusDropdown 
                  currentStatus={currentStatus}
                  allStatuses={allStatuses}
                  onStatusChange={(newStatusId) => onStatusChange(surgery.id, newStatusId)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}