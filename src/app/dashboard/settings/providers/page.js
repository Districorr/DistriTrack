// --- START OF FILE: src/app/dashboard/settings/providers/page.js (FINAL FIX WITH SAFE DELETE) ---

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProvidersPage() {
  const supabase = createClient();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProviderName, setNewProviderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        toast.error('Error al cargar los proveedores: ' + error.message);
      } else {
        setProviders(data || []);
      }
      setIsLoading(false);
    };
    fetchProviders();
  }, [supabase]);

  const handleUpdateProvider = (id, field, value) => {
    setProviders(prev => 
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveChanges = async (provider) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('providers')
      .update({ name: provider.name, color: provider.color })
      .eq('id', provider.id);
    
    if (error) {
      toast.error('Error al guardar los cambios: ' + error.message);
    } else {
      toast.success(`Proveedor "${provider.name}" actualizado.`);
    }
    setIsSaving(false);
  };

  const handleAddProvider = async () => {
    if (!newProviderName.trim()) {
      toast.error('El nombre del proveedor no puede estar vacío.');
      return;
    }
    setIsSaving(true);
    const { data, error } = await supabase
      .from('providers')
      .insert({ name: newProviderName.trim() })
      .select()
      .single();

    if (error) {
      toast.error('Error al crear el proveedor: ' + error.message);
    } else {
      setProviders(prev => [...prev, data]);
      setNewProviderName('');
      toast.success('Proveedor creado exitosamente.');
    }
    setIsSaving(false);
  };

  // --- CORRECCIÓN CLAVE: Se utiliza la nueva función RPC para eliminar de forma segura ---
  const handleDeleteProvider = async (provider) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al proveedor "${provider.name}"?`)) {
      const { data, error } = await supabase.rpc('delete_provider_safely', {
        p_provider_id: provider.id
      });

      if (error) {
        toast.error('Error al eliminar: ' + error.message);
      } else {
        if (data.startsWith('Éxito:')) {
          setProviders(prev => prev.filter(p => p.id !== provider.id));
          toast.success(data);
        } else {
          // Si la RPC devuelve el mensaje de "En uso", lo mostramos como un error.
          toast.error(data);
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Administrar Proveedores</h1>
                <p className="mt-1 text-sm text-gray-600">Añade, edita o elimina los proveedores y asigna un color para identificarlos.</p>
            </div>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Volver al Dashboard
            </Link>
        </div>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <input
            type="text"
            value={newProviderName}
            onChange={(e) => setNewProviderName(e.target.value)}
            placeholder="Nombre del nuevo proveedor"
            className="flex-grow p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleAddProvider}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            <PlusCircle size={16} className="mr-2" />
            Añadir
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Cargando proveedores...</p>
          ) : (
            providers.length > 0 ? (
              providers.map(provider => (
                <div key={provider.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
                  <input
                    type="color"
                    value={provider.color || '#6B7280'}
                    onChange={(e) => handleUpdateProvider(provider.id, 'color', e.target.value)}
                    className="h-10 w-10 p-0 border-none cursor-pointer rounded-md"
                  />
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => handleUpdateProvider(provider.id, 'name', e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md text-gray-900"
                  />
                  <button
                    onClick={() => handleSaveChanges(provider)}
                    disabled={isSaving}
                    className="p-2 text-gray-500 hover:text-green-600"
                    title="Guardar cambios"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Eliminar proveedor"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No hay proveedores creados. Comienza añadiendo uno.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}