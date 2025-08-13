// --- START OF FILE: src/app/dashboard/components/modal/NotesAndHistory.js (WITH REMINDERS TAB) ---

'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
// --- CORRECCIÓN: Importamos el nuevo componente de recordatorios ---
import RemindersTab from './RemindersTab';

// --- Componente de Ayuda: Botón de Pestaña (sin cambios) ---
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

// --- Componente de Ayuda: Ítem de Nota (sin cambios) ---
const NoteItem = ({ note }) => {
  const userName = note.user?.full_name || 'Usuario desconocido';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="relative flex items-start space-x-3 pb-4">
      <div className="absolute left-4 top-5 h-full w-0.5 bg-gray-200 last:hidden"></div>
      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center z-10">
        <span className="text-xs font-bold text-gray-600">{userInitials}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString('es-AR')}</p>
        </div>
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
        {!note.is_visible_to_all && (
            <div className="mt-2 text-right">
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    Solo Admins
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

// --- Componente de Ayuda: Formulario para Añadir Nota (sin cambios) ---
const AddNoteForm = ({ surgeryId, userRole, onNoteAdded }) => {
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.error("No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.");
        setIsSubmitting(false);
        return;
    }

    const { error } = await supabase
      .from('surgery_notes')
      .insert({
        surgery_id: surgeryId,
        user_id: user.id,
        content: content.trim(),
        is_visible_to_all: isVisible,
      });

    setIsSubmitting(false);

    if (error) {
      toast.error('Error al agregar la nota: ' + error.message);
    } else {
      toast.success('Nota agregada.');
      setContent('');
      onNoteAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe una nueva nota o novedad..."
        className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
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
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Agregando...' : '+ Agregar Novedad'}
        </button>
      </div>
    </form>
  );
};

// --- Componente Principal (Modificado) ---
export default function NotesAndHistory({ surgery, onUpdate, userRole }) {
  const [activeTab, setActiveTab] = useState('notes');

  const sortedNotes = surgery.surgery_notes?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
  const sortedHistory = surgery.surgery_history?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Notas</TabButton>
          <TabButton isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}>Historial</TabButton>
          {/* --- CORRECCIÓN: Se añade la nueva pestaña de Recordatorios --- */}
          <TabButton isActive={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')}>Recordatorios</TabButton>
        </nav>
      </div>
      <div className="mt-4">
        {activeTab === 'notes' && (
          <div>
            <div className="pr-2 space-y-0">
              {sortedNotes.length > 0 ? (
                sortedNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No hay notas en este pedido.</p>
              )}
            </div>
            <AddNoteForm 
                surgeryId={surgery.id} 
                userRole={userRole} 
                onNoteAdded={onUpdate}
            />
          </div>
        )}
        {activeTab === 'history' && (
          <ul className="space-y-3 pr-2">
            {sortedHistory.length > 0 ? sortedHistory.map(entry => (
              <li key={entry.id} className="text-sm pb-2 border-b border-gray-100 last:border-b-0">
                <p className="font-medium text-gray-900">{entry.change_description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleString('es-AR')} por <span className="font-semibold">{entry.user?.full_name || 'Usuario'}</span>
                </p>
              </li>
            )) : (
                <p className="py-4 text-center text-sm text-gray-500">No hay historial de cambios.</p>
            )}
          </ul>
        )}
        {/* --- CORRECCIÓN: Se añade el renderizado condicional para la nueva pestaña --- */}
        {activeTab === 'reminders' && (
          <RemindersTab surgeryId={surgery.id} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}