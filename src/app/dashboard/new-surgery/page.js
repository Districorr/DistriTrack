// --- START OF FILE: src/app/dashboard/new-surgery/page.js (FULL AND WITH UX IMPROVEMENT) ---

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function NewMaterialModal({ isOpen, onClose, onSave }) {
  const [newMaterial, setNewMaterial] = useState({ code: '', name: '', brand: '', specification: '' });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!newMaterial.name) {
      alert('El nombre del material es obligatorio.');
      return;
    }
    setIsSaving(true);
    const { data, error } = await supabase.from('materials').insert([newMaterial]).select().single();
    setIsSaving(false);
    if (error) {
      alert(`Error al guardar el material: ${error.message}`);
    } else {
      onSave(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Crear Nuevo Material</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Código (opcional)" value={newMaterial.code} onChange={(e) => setNewMaterial({...newMaterial, code: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
          <input type="text" placeholder="* Nombre / Descripción" required value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
          <input type="text" placeholder="Marca / Proveedor" value={newMaterial.brand} onChange={(e) => setNewMaterial({...newMaterial, brand: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
          <input type="text" placeholder="Especificación" value={newMaterial.specification} onChange={(e) => setNewMaterial({...newMaterial, specification: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">{isSaving ? 'Guardando...' : 'Guardar y Añadir'}</button>
        </div>
      </div>
    </div>
  );
}

export default function NewSurgeryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({ patient_name: '', doctor_name: '', institution: '', client: '', surgery_date: '', provider: '', transport_details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialToAdd, setMaterialToAdd] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteData, setNoteData] = useState({ description: '', quantity: 1, observations: '' });
  const [isUrgent, setIsUrgent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setMaterialToAdd(null);
    setShowNoteInput(false);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    const { data } = await supabase.from('materials').select('id, code, name, brand').or(`name.ilike.%${term}%,code.ilike.%${term}%`).limit(10);
    setSearchResults(data || []);
    setIsLoadingSearch(false);
  };

  const handleSelectMaterial = (material) => {
    setMaterialToAdd(material);
    setSearchTerm('');
    setSearchResults([]);
    setShowNoteInput(false);
  };

  const handleConfirmAddMaterial = () => {
    if (!materialToAdd) return;
    if (quantity < 1) {
      alert("La cantidad debe ser al menos 1.");
      return;
    }
    if (!selectedMaterials.find(m => m.type === 'formal' && m.id === materialToAdd.id)) {
      setSelectedMaterials([...selectedMaterials, { ...materialToAdd, quantity_requested: quantity, observations: observations, type: 'formal' }]);
    } else {
      alert("Este material ya ha sido agregado al pedido.");
    }
    setMaterialToAdd(null);
    setQuantity(1);
    setObservations('');
  };

  const handleConfirmAddNote = () => {
    if (!noteData.description.trim()) {
      alert("La descripción de la nota no puede estar vacía.");
      return;
    }
    if (noteData.quantity < 1) {
      alert("La cantidad debe ser al menos 1.");
      return;
    }
    const newNote = {
      id: `note_${Date.now()}`,
      free_text_description: noteData.description,
      quantity_requested: noteData.quantity,
      observations: noteData.observations,
      type: 'note'
    };
    setSelectedMaterials([...selectedMaterials, newNote]);
    setNoteData({ description: '', quantity: 1, observations: '' });
    setShowNoteInput(false);
  };

  const handleRemoveMaterial = (materialId) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };
  
  const handleNewMaterialCreated = (newMaterial) => {
    handleSelectMaterial(newMaterial);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (selectedMaterials.length === 0) {
      setError('Debe agregar al menos un material al pedido.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: initialStatus, error: statusError } = await supabase
        .from('pipeline_statuses')
        .select('id, name')
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

      if (statusError || !initialStatus) {
        throw new Error('No se pudo encontrar el estado inicial del pipeline.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se pudo obtener la información del usuario.');

      const surgeryPayload = { 
        ...formData, 
        is_urgent: isUrgent, 
        status_id: initialStatus.id, 
        creator_id: user.id 
      };

      const { data: newSurgery, error: surgeryError } = await supabase.from('surgeries').insert([surgeryPayload]).select().single();
      if (surgeryError) throw surgeryError;

      const materialsToInsert = selectedMaterials.map(m => {
        if (m.type === 'note') {
          return { surgery_id: newSurgery.id, material_id: null, quantity_requested: m.quantity_requested, observations: m.observations, free_text_description: m.free_text_description };
        } else {
          return { surgery_id: newSurgery.id, material_id: m.id, quantity_requested: m.quantity_requested, observations: m.observations, free_text_description: null };
        }
      });

      const { error: materialsError } = await supabase.from('surgery_materials').insert(materialsToInsert);
      if (materialsError) throw materialsError;

      const { error: historyError } = await supabase.from('surgery_history').insert({ surgery_id: newSurgery.id, user_id: user.id, change_description: `Pedido creado en estado "${initialStatus.name}".`, details: { action: 'create', status: initialStatus.name } });
      if (historyError) {
        console.error("Error al guardar en el historial:", historyError);
      }

      alert('¡Pedido creado con éxito!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      setError(`Error al crear el pedido: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NewMaterialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleNewMaterialCreated} />
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Pedido</h1>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Volver al Pipeline</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label htmlFor="patient_name" className="block text-sm font-medium text-gray-800">Nombre del Paciente</label><input type="text" name="patient_name" id="patient_name" required value={formData.patient_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/></div>
              <div><label htmlFor="doctor_name" className="block text-sm font-medium text-gray-800">Médico Tratante</label><input type="text" name="doctor_name" id="doctor_name" value={formData.doctor_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/></div>
              <div><label htmlFor="institution" className="block text-sm font-medium text-gray-800">Institución</label><input type="text" name="institution" id="institution" value={formData.institution} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/></div>
              <div><label htmlFor="client" className="block text-sm font-medium text-gray-800">Cliente</label><input type="text" name="client" id="client" value={formData.client} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/></div>
            </div>
            
            <div className="border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div><label htmlFor="surgery_date" className="block text-sm font-medium text-gray-800">Fecha de Cirugía</label><input type="date" name="surgery_date" id="surgery_date" required value={formData.surgery_date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"/></div>
              <div><label htmlFor="provider" className="block text-sm font-medium text-gray-800">Proveedor a Solicitar</label><input type="text" name="provider" id="provider" value={formData.provider} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/></div>
              <div className="md:col-span-2"><label htmlFor="transport_details" className="block text-sm font-medium text-gray-800">Detalles del Transporte</label><textarea name="transport_details" id="transport_details" rows="3" value={formData.transport_details} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"></textarea></div>
              
              <div className="md:col-span-2 flex items-center space-x-3">
                <input
                  id="is_urgent"
                  name="is_urgent"
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_urgent" className="font-medium text-gray-800">
                  Marcar como Pedido Urgente
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Materiales Solicitados</h3>
              
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="search_material" className="block text-sm font-medium text-gray-800">1. Buscar Material por código o nombre</label>
                  <button type="button" onClick={() => setIsModalOpen(true)} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                    + Crear Nuevo
                  </button>
                </div>
                <input type="text" id="search_material" value={searchTerm} onChange={handleSearchChange} placeholder="Escriba para buscar..." className="block w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"/>
                {isLoadingSearch && <p className="text-sm text-gray-500 mt-1">Buscando...</p>}
                {searchResults.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(material => (
                      <li key={material.id} onClick={() => handleSelectMaterial(material)} className="px-4 py-2 cursor-pointer hover:bg-indigo-50"><p className="font-semibold text-gray-900">{material.name} ({material.code})</p></li>
                    ))}
                  </ul>
                )}
                {searchTerm.length >= 3 && !isLoadingSearch && searchResults.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 p-4 bg-white border border-gray-200 rounded-md shadow-lg">
                    <p className="text-center text-gray-500">No se encontraron resultados.</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button type="button" onClick={() => { setShowNoteInput(true); setMaterialToAdd(null); setSearchTerm(''); setSearchResults([]); }} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                  ¿No encuentras el material? Añádelo como una nota
                </button>
              </div>

              {showNoteInput && (
                <div className="p-4 border-2 border-dashed border-orange-400 bg-orange-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-3"><h4 className="font-semibold text-gray-900">Añadir Material como Nota</h4></div>
                  <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-800">1. Descripción del material</label><input type="text" value={noteData.description} onChange={(e) => setNoteData({...noteData, description: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900"/></div>
                  <div><label className="block text-sm font-medium text-gray-800">2. Cantidad</label><input type="number" min="1" value={noteData.quantity} onChange={(e) => setNoteData({...noteData, quantity: parseInt(e.target.value, 10)})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900"/></div>
                  <div><label className="block text-sm font-medium text-gray-800">3. Observaciones</label><input type="text" value={noteData.observations} onChange={(e) => setNoteData({...noteData, observations: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-gray-900"/></div>
                  <button type="button" onClick={handleConfirmAddNote} className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 h-10">Añadir Nota al Pedido</button>
                </div>
              )}

              {materialToAdd && (
                <div className="p-4 border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-3"><h4 className="font-semibold text-gray-900">{materialToAdd.name}</h4><p className="text-sm text-gray-600">{materialToAdd.code} - {materialToAdd.brand}</p></div>
                  <div><label className="block text-sm font-medium text-gray-800">2. Cantidad</label><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="w-full p-2 border border-gray-300 rounded-md text-gray-900"/></div>
                  <div><label className="block text-sm font-medium text-gray-800">3. Observaciones</label><input type="text" value={observations} onChange={(e) => setObservations(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-gray-900"/></div>
                  <button type="button" onClick={handleConfirmAddMaterial} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 h-10">Añadir al Pedido</button>
                </div>
              )}

              <div className="mt-4 flow-root">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead><tr><th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Material</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cantidad</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Observaciones</th><th></th></tr></thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedMaterials.length === 0 ? (
                      <tr><td colSpan="4" className="py-4 text-center text-gray-500">No se han agregado materiales.</td></tr>
                    ) : (
                      selectedMaterials.map(m => (
                        <tr key={m.id}>
                          <td className="py-4 pl-4 pr-3 text-sm sm:pl-0">
                            {m.type === 'formal' ? (
                              <>
                                <div className="font-medium text-gray-900">{m.name}</div>
                                <div className="text-gray-500">{m.code}</div>
                              </>
                            ) : (
                              <div className="italic text-orange-700">
                                <div className="font-medium">{m.free_text_description}</div>
                                <div className="text-xs font-normal">(Nota provisoria)</div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900">{m.quantity_requested}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{m.observations || '-'}</td>
                          <td className="py-4 pl-3 pr-4 text-right text-sm font-medium"><button type="button" onClick={() => handleRemoveMaterial(m.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {error && <div className="p-4 text-center text-red-800 bg-red-100 border border-red-300 rounded-md"><p>{error}</p></div>}
            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-4">
              <Link href="/dashboard" className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</Link>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{isSubmitting ? 'Guardando...' : 'Crear Pedido'}</button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
