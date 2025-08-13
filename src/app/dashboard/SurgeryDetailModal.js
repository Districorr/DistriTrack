// --- START OF FILE: src/app/dashboard/SurgeryDetailModal.js (WITH EXPORT ACTIONS) ---

'use client';

import { useState, useEffect, useRef } from 'react'; // Se añade useRef
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import GeneralInfoPanel from './components/modal/GeneralInfoPanel';
import MaterialsList from './components/modal/MaterialsList';
import NotesAndHistory from './components/modal/NotesAndHistory';
import StatusToggles from './components/modal/StatusToggles';
import ModalActions from './components/modal/ModalActions'; // Se importa el nuevo componente

export default function SurgeryDetailModal({ surgery, userRole, onClose, onUpdate, onCancelSurgery }) {
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editableSurgery, setEditableSurgery] = useState(null);
  const [show, setShow] = useState(false);

  // --- CORRECCIÓN: Se crea una ref para el contenido del modal ---
  const modalContentRef = useRef(null);

  useEffect(() => {
    setEditableSurgery(surgery);
    if (isEditing) {
      setIsEditing(false);
    }
    if (surgery) {
      requestAnimationFrame(() => {
        setShow(true);
      });
    }
  }, [surgery]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!surgery) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditableSurgery(prev => (prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null));
  };

  const handleCancelEdit = () => {
    setEditableSurgery(surgery);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editableSurgery) return;
    setIsLoading(true);
    
    const { error } = await supabase.rpc('update_surgery_details', {
      p_surgery_id: editableSurgery.id,
      p_doctor_name: editableSurgery.doctor_name,
      p_institution: editableSurgery.institution,
      p_client: editableSurgery.client,
      p_provider: editableSurgery.provider,
      p_surgery_date: editableSurgery.surgery_date,
      p_is_urgent: editableSurgery.is_urgent,
      p_is_rework: editableSurgery.is_rework,
    });

    setIsLoading(false);

    if (error) {
      toast.error(`Error al guardar: ${error.message}`);
    } else {
      toast.success('Pedido actualizado correctamente.');
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleCancelClick = () => {
    const reason = prompt("Por favor, ingrese el motivo de la cancelación del pedido:");
    if (reason) {
      onCancelSurgery(reason);
      handleClose();
    } else if (reason === "") {
        alert("Debe especificar un motivo para la cancelación.");
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-red bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* --- CORRECCIÓN: Se adjunta la ref al div que queremos capturar --- */}
      <div 
        ref={modalContentRef}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">
              Detalle del Pedido: {surgery.patient_name}
            </h2>
            {/* --- CORRECCIÓN: Se añade el componente de acciones --- */}
            <ModalActions surgery={surgery} modalRef={modalContentRef} />
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </header>

        <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-10 gap-6 overflow-y-auto">
          <div className="md:col-span-7 space-y-4">
            <StatusToggles
                surgery={editableSurgery || surgery}
                isEditing={isEditing}
                handleInputChange={handleInputChange}
                userRole={userRole}
            />
            <MaterialsList
              materials={surgery.surgery_materials || []}
              onUpdate={onUpdate}
              userRole={userRole}
            />
            <NotesAndHistory
              surgery={surgery}
              onUpdate={onUpdate}
              userRole={userRole}
            />
          </div>
          <div className="md:col-span-3">
            <GeneralInfoPanel
              surgery={editableSurgery || surgery}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
            />
          </div>
        </main>

        <footer className="p-3 border-t flex justify-between items-center flex-shrink-0">
          <div>
            {userRole === 'admin' && (
              <button 
                onClick={handleCancelClick} 
                disabled={isLoading}
                className="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Cancelar Pedido
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={handleClose} className="px-3 py-1.5 text-sm rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
              Cerrar
            </button>
            {isEditing ? (
              <>
                <button onClick={handleCancelEdit} className="px-3 py-1.5 text-sm rounded-md text-gray-700">
                  Cancelar Edición
                </button>
                <button onClick={handleSave} disabled={isLoading} className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Editar Pedido
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}