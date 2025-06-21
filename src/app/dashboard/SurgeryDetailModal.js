'use client'

import { useState, useEffect } from 'react'

// Función para formatear fecha y hora
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('es-AR', options);
};

// Función para formatear solo fecha
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// El modal ahora recibe la nueva prop 'onFormalize'
export default function SurgeryDetailModal({ surgery, onClose, userRole, onMarkAsMissing, onCancelSurgery, onFormalize }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (surgery) {
      requestAnimationFrame(() => { setShow(true); });
    } else {
      setShow(false);
    }
  }, [surgery]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleCancelClick = () => {
    const reason = prompt("Por favor, ingrese el motivo de la cancelación:");
    if (reason !== null) {
      onCancelSurgery(surgery.id, reason);
      handleClose();
    }
  };

  if (!surgery) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-center items-start p-4 overflow-y-auto transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl my-8 transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido: {surgery.patient_name}</h2>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-900 text-3xl font-light">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Información General</h3>
            <p><strong className="font-semibold text-gray-900">Médico:</strong> <span className="text-gray-800">{surgery.doctor_name || 'N/A'}</span></p>
            <p><strong className="font-semibold text-gray-900">Institución:</strong> <span className="text-gray-800">{surgery.institution || 'N/A'}</span></p>
            <p><strong className="font-semibold text-gray-900">Cliente:</strong> <span className="text-gray-800">{surgery.client || 'N/A'}</span></p>
            <p><strong className="font-semibold text-gray-900">Fecha de Cirugía:</strong> <span className="text-gray-800">{formatDate(surgery.surgery_date)}</span></p>
            <p><strong className="font-semibold text-gray-900">Proveedor:</strong> <span className="text-gray-800">{surgery.provider || 'N/A'}</span></p>
            <p><strong className="font-semibold text-gray-900">Transporte:</strong> <span className="text-gray-800">{surgery.transport_details || 'N/A'}</span></p>
            <p><strong className="font-semibold text-gray-900">Creado por:</strong> <span className="text-gray-800">{surgery.creator?.full_name || 'N/A'}</span></p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Historial de Cambios</h3>
            <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {surgery.surgery_history?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(entry => (
                <li key={entry.id} className="text-sm">
                  <p className="font-medium text-gray-900">{entry.change_description}</p>
                  <p className="text-xs text-gray-600">{formatDateTime(entry.created_at)} por <span className="font-semibold">{entry.user?.full_name || 'Usuario desconocido'}</span></p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiales Solicitados</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Material</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Observaciones</th>
                {userRole === 'admin' && <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surgery.surgery_materials?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-sm">
                    {item.materials ? (
                      <div>
                        <p className="font-medium text-gray-900">{item.materials.name}</p>
                        <p className="text-gray-600">{item.materials.code} - {item.materials.brand}</p>
                      </div>
                    ) : (
                      <div className="font-medium text-orange-600 bg-orange-50 p-2 rounded-md">
                        <p>{item.free_text_description}</p>
                        <p className="text-xs font-normal">(Provisorio)</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.quantity_requested}</td>
                  <td className="px-4 py-4 text-sm text-gray-800">{item.observations || '-'}</td>
                  {userRole === 'admin' && (
                    <td className="px-4 py-4 text-sm">
                      {item.materials ? (
                        item.is_missing ? (
                          <span className="px-2 py-1 font-semibold text-red-800 bg-red-100 rounded-full">Faltante</span>
                        ) : (
                          <button onClick={() => onMarkAsMissing(item.id, surgery.id)} className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600">Marcar Faltante</button>
                        )
                      ) : (
                        <button onClick={() => onFormalize(item.id, item.free_text_description)} className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">Asignar Código</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userRole === 'admin' && (
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Cancelar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}