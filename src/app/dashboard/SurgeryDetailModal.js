// --- START OF FILE: src/app/dashboard/SurgeryDetailModal.js (FULL, POLISHED, AND VERIFIED) ---

'use client'

import { useState, useEffect } from 'react'

// --- Componente de Ayuda: Botón de Pestaña ---
const TabButton = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
      isActive
        ? 'text-indigo-600 border-indigo-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {children}
  </button>
);

// --- Componente de Ayuda: Toggle para Etiquetas ---
const TagToggle = ({ label, enabled, onChange, color = 'indigo', disabled }) => (
  <div className="flex items-center space-x-2">
    <button
      type="button"
      disabled={disabled}
      className={`${
        enabled ? `bg-${color}-600` : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50`}
      onClick={onChange}
    >
      <span
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </div>
);

// --- Componente de Ayuda: Ítem de Nota con Línea de Tiempo ---
const NoteItem = ({ note, userRole, onToggleVisibility, isLast, loadingAction }) => {
  const isPrivate = !note.is_visible_to_all;
  return (
    <div className="relative flex items-start space-x-4 pb-6">
      {!isLast && <div className="absolute left-4 top-5 h-full w-0.5 bg-gray-200"></div>}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center z-10">
        <span className="text-xs font-bold text-gray-600">
          {note.user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{note.user?.full_name || 'Usuario desconocido'}</p>
          <p className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString('es-AR')}</p>
        </div>
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
        {userRole === 'admin' && (
          <div className="mt-2 flex items-center justify-end space-x-2">
            <span className={`text-xs font-medium ${isPrivate ? 'text-red-600' : 'text-gray-500'}`}>
              {isPrivate ? 'Solo Admins' : 'Visible para todos'}
            </span>
            <button
              disabled={loadingAction === note.id}
              onClick={() => onToggleVisibility(note.id, !note.is_visible_to_all)}
              className={`${
                isPrivate ? 'bg-red-600' : 'bg-gray-200'
              } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50`}
            >
              <span
                className={`${
                  isPrivate ? 'translate-x-4' : 'translate-x-0'
                } inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Componente de Ayuda: Formulario para Añadir Nota ---
const AddNoteForm = ({ surgeryId, userRole, onAddNote }) => {
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    await onAddNote(surgeryId, content, isVisible);
    setContent('');
    setIsSubmitting(false);
  };
  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe una nueva nota o novedad..."
        className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900"
        rows="3"
      />
      <div className="mt-2 flex items-center justify-between">
        {userRole === 'admin' ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="note-visibility"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="note-visibility" className="text-sm text-gray-600">Visible para todos</label>
          </div>
        ) : (
          <div></div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Agregando...' : '+ Agregar Novedad'}
        </button>
      </div>
    </form>
  );
};

// --- Componente de Ayuda: Formateador de Fecha ---
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Componente Principal del Modal ---
export default function SurgeryDetailModal({ surgery, onClose, userRole, onMarkAsMissing, onCancelSurgery, onFormalize, onToggleUrgent, onToggleRework, onAddNote, onToggleNoteVisibility }) {
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (surgery) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [surgery]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
      setActiveTab('notes');
    }, 300);
  };

  const handleAction = async (action, ...args) => {
    const actionId = args[0] || action.name; // Usa el ID o el nombre de la función como identificador
    setLoadingAction(actionId);
    try {
      await action(...args);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelClick = () => {
    const reason = prompt("Por favor, ingrese el motivo de la cancelación:");
    if (reason !== null) {
      handleAction(onCancelSurgery, surgery.id, reason);
      handleClose();
    }
  };

  if (!surgery) return null;

  const sortedNotes = surgery.surgery_notes?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
  const sortedHistory = surgery.surgery_history?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];

  return (
    <div className={`fixed inset-0 z-40 flex justify-center items-start p-4 overflow-y-auto transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} style={{ backdropFilter: 'blur(4px)' }}>
      <div className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl my-8 transform transition-all duration-300 ease-in-out ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido: {surgery.patient_name}</h2>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-900 text-3xl font-light" aria-label="Cerrar detalle del pedido">×</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Información General</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p><strong className="font-semibold text-gray-900">Médico:</strong> <span className="text-gray-800">{surgery.doctor_name || 'N/A'}</span></p>
                <p><strong className="font-semibold text-gray-900">Proveedor:</strong> <span className="text-gray-800">{surgery.provider || 'N/A'}</span></p>
                <p><strong className="font-semibold text-gray-900">Institución:</strong> <span className="text-gray-800">{surgery.institution || 'N/A'}</span></p>
                <p><strong className="font-semibold text-gray-900">Transporte:</strong> <span className="text-gray-800">{surgery.transport_details || 'N/A'}</span></p>
                <p><strong className="font-semibold text-gray-900">Cliente:</strong> <span className="text-gray-800">{surgery.client || 'N/A'}</span></p>
                <p><strong className="font-semibold text-gray-900">Creado por:</strong> <span className="text-gray-800">{surgery.creator?.full_name || 'N/A'}</span></p>
                <p className="font-semibold col-span-full"><strong className="font-semibold text-gray-900">Fecha de Cirugía:</strong> <span className="text-gray-900">{formatDate(surgery.surgery_date)}</span></p>
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiales Solicitados</h3>
              <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><th className="px-4 py-2">Material</th><th className="px-4 py-2">Cantidad</th><th className="px-4 py-2">Observaciones</th>{userRole === 'admin' && <th className="px-4 py-2">Acciones</th>}</tr></thead><tbody className="bg-white divide-y divide-gray-200">
                {surgery.surgery_materials?.length > 0 ? (
                  surgery.surgery_materials.map((item) => (<tr key={item.id} className="text-sm"><td className="px-4 py-3">{item.materials ? (<div><p className="font-medium text-gray-900">{item.materials.name}</p><p className="text-gray-500">{item.materials.code} - {item.materials.brand}</p></div>) : (<div className="font-medium text-orange-600 bg-orange-50 p-2 rounded-md"><p>{item.free_text_description}</p><p className="text-xs font-normal">(Provisorio)</p></div>)}</td><td className="px-4 py-3 font-medium text-gray-800">{item.quantity_requested}</td><td className="px-4 py-3 text-gray-700">{item.observations || '-'}</td>{userRole === 'admin' && (<td className="px-4 py-3">{item.materials ? (item.is_missing ? (<span className="px-2 py-1 font-semibold text-red-800 bg-red-100 rounded-full text-xs">Faltante</span>) : (<button disabled={loadingAction === item.id} onClick={() => handleAction(onMarkAsMissing, item.id, surgery.id)} className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50">Marcar Faltante</button>)) : (<button disabled={loadingAction === item.id} onClick={() => handleAction(onFormalize, item.id, item.free_text_description)} className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50">Asignar Código</button>)}</td>)}</tr>))
                ) : (
                  <tr><td colSpan={userRole === 'admin' ? 4 : 3} className="px-4 py-8 text-center text-gray-500">No hay materiales solicitados.</td></tr>
                )}
              </tbody></table></div>
            </section>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <section>
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">Etiquetas de Estado</h3>
              <div className="flex items-center space-x-6 pt-2">
                <TagToggle label="Urgente" enabled={surgery.is_urgent} onChange={() => handleAction(onToggleUrgent, surgery.id, !surgery.is_urgent)} color="red" disabled={loadingAction === surgery.id} />
                {userRole === 'admin' && (<TagToggle label="Reproceso" enabled={surgery.is_rework} onChange={() => handleAction(onToggleRework, surgery.id, !surgery.is_rework)} color="purple" disabled={loadingAction === surgery.id} />)}
              </div>
            </section>
            <section>
              <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-4" aria-label="Tabs"><TabButton isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Notas</TabButton><TabButton isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}>Historial</TabButton></nav></div>
              <div className="mt-4">
                {activeTab === 'notes' && (<div><div className="max-h-72 overflow-y-auto pr-2">{sortedNotes.length > 0 ? (sortedNotes.map((note, index) => <NoteItem key={note.id} note={note} userRole={userRole} onToggleVisibility={(noteId, visibility) => handleAction(onToggleNoteVisibility, noteId, visibility)} isLast={index === sortedNotes.length - 1} loadingAction={loadingAction} />)) : (<p className="py-4 text-center text-sm text-gray-500">No hay notas en este pedido.</p>)}</div><AddNoteForm surgeryId={surgery.id} userRole={userRole} onAddNote={onAddNote} /></div>)}
                {activeTab === 'history' && (<ul className="space-y-3 max-h-80 overflow-y-auto pr-2">{sortedHistory.map(entry => (<li key={entry.id} className="text-sm"><p className="font-medium text-gray-900">{entry.change_description}</p><p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString('es-AR')} por <span className="font-semibold">{entry.user?.full_name || 'Usuario desconocido'}</span></p></li>))}</ul>)}
              </div>
            </section>
          </div>
        </div>
        {userRole === 'admin' && (<div className="mt-8 pt-4 border-t border-gray-200 flex justify-end"><button onClick={handleCancelClick} disabled={!!loadingAction} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">Cancelar Pedido</button></div>)}
      </div>
    </div>
  );
}