// --- START OF FILE: src/app/dashboard/components/modal/RemindersTab.js (COLOR FIX) ---

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Bell, Trash2, CheckCircle } from 'lucide-react';

export default function RemindersTab({ surgeryId, onUpdate }) {
  const supabase = createClient();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({ note: '', remind_at: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*, user:profiles(full_name)') // Pedimos el nombre del usuario
        .eq('surgery_id', surgeryId)
        .order('remind_at', { ascending: true });

      if (error) {
        toast.error('Error al cargar recordatorios: ' + error.message);
      } else {
        setReminders(data);
      }
      setIsLoading(false);
    };
    fetchReminders();
  }, [surgeryId, supabase]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({ ...prev, [name]: value }));
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.note || !newReminder.remind_at) {
      toast.error('Debe completar la nota y la fecha del recordatorio.');
      return;
    }
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('No se pudo identificar al usuario.');
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        surgery_id: surgeryId,
        user_id: user.id,
        note: newReminder.note,
        remind_at: newReminder.remind_at,
      })
      .select('*, user:profiles(full_name)') // Pedimos los datos completos al insertar
      .single();

    if (error) {
      toast.error('Error al crear el recordatorio: ' + error.message);
    } else {
      setReminders(prev => [...prev, data].sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at)));
      setNewReminder({ note: '', remind_at: '' });
      toast.success('Recordatorio creado.');
    }
    setIsSaving(false);
  };

  const toggleComplete = async (reminder) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: !reminder.is_completed })
      .eq('id', reminder.id);
    
    if (error) {
      toast.error('Error al actualizar el recordatorio.');
    } else {
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r));
    }
  };

  const handleDelete = async (reminderId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
      const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
      if (error) {
        toast.error('Error al eliminar.');
      } else {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
        toast.success('Recordatorio eliminado.');
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleAddReminder} className="p-4 border-b border-gray-200 space-y-3">
        <h4 className="font-semibold text-gray-800">Añadir Nuevo Recordatorio</h4>
        <div>
          {/* --- CORRECCIÓN: Se añade 'text-gray-700' a la etiqueta --- */}
          <label htmlFor="remind_at" className="text-sm font-medium text-gray-700">Fecha y Hora</label>
          <input
            type="datetime-local"
            id="remind_at"
            name="remind_at"
            value={newReminder.remind_at}
            onChange={handleInputChange}
            // --- CORRECCIÓN: Se añade 'text-gray-900' al input ---
            className="w-full p-2 border border-gray-300 rounded-md mt-1 text-gray-900"
          />
        </div>
        <div>
          {/* --- CORRECCIÓN: Se añade 'text-gray-700' a la etiqueta --- */}
          <label htmlFor="note" className="text-sm font-medium text-gray-700">Nota</label>
          <textarea
            id="note"
            name="note"
            value={newReminder.note}
            onChange={handleInputChange}
            rows="2"
            placeholder="Ej: Llamar al proveedor para confirmar entrega"
            // --- CORRECCIÓN: Se añade 'text-gray-900' y 'placeholder-gray-400' ---
            className="w-full p-2 border border-gray-300 rounded-md mt-1 text-gray-900 placeholder-gray-400"
          />
        </div>
        <button type="submit" disabled={isSaving} className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
          {isSaving ? 'Guardando...' : 'Guardar Recordatorio'}
        </button>
      </form>

      <div className="p-4 space-y-4">
        {isLoading ? <p className="text-center text-gray-500">Cargando...</p> : reminders.map(reminder => (
          <div key={reminder.id} className={`p-3 rounded-md flex items-start gap-4 ${reminder.is_completed ? 'bg-gray-100' : 'bg-yellow-50'}`}>
            <div className={`mt-1 ${reminder.is_completed ? 'text-gray-400' : 'text-yellow-500'}`}><Bell size={20} /></div>
            <div className="flex-grow">
              <p className={`text-sm text-gray-800 ${reminder.is_completed ? 'line-through text-gray-500' : ''}`}>{reminder.note}</p>
              <p className={`text-xs mt-1 ${reminder.is_completed ? 'text-gray-400' : 'text-yellow-700'}`}>
                {new Date(reminder.remind_at).toLocaleString('es-AR')}
              </p>
              {/* --- CORRECCIÓN: Se añade el nombre del creador del recordatorio --- */}
              <p className="text-xs mt-1 text-gray-400">
                Creado por: {reminder.user?.full_name || 'Usuario desconocido'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleComplete(reminder)} title={reminder.is_completed ? 'Marcar como pendiente' : 'Marcar como completado'}>
                <CheckCircle size={20} className={reminder.is_completed ? 'text-green-500' : 'text-gray-300 hover:text-green-500'} />
              </button>
              <button onClick={() => handleDelete(reminder.id)} title="Eliminar recordatorio">
                <Trash2 size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && reminders.length === 0 && <p className="text-center text-gray-500 py-4">No hay recordatorios para este pedido.</p>}
      </div>
    </div>
  );
}
