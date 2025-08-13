// --- START OF FILE: src/app/dashboard/new-surgery/page.js (ESLINT FIX) ---

'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { UserIcon, BuildingOffice2Icon, BriefcaseIcon, ClipboardDocumentListIcon, TruckIcon } from '@heroicons/react/24/outline'

import CreateMaterialModal from '../components/modal/CreateMaterialModal'

// --- Componente de Autocompletado (sin cambios) ---
function AutocompleteInput({ label, value, onValueChange, fetchSuggestions, placeholder, icon: Icon }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  // --- CORRECCIÓN CLAVE: Se añade el array de dependencias a useCallback ---
  const debouncedFetch = useCallback(
    debounce(async (searchTerm) => {
      if (searchTerm.length < 2) {
        setSuggestions([])
        return
      }
      setIsLoading(true)
      const fetchedSuggestions = await fetchSuggestions(searchTerm)
      setSuggestions(fetchedSuggestions || [])
      setIsLoading(false)
    }, 300),
    [fetchSuggestions] // Se añade la dependencia
  )

  const handleInputChange = (e) => {
    const term = e.target.value
    onValueChange(term)
    debouncedFetch(term)
  }

  const handleSuggestionClick = (suggestion) => {
    onValueChange(suggestion.name)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full rounded-md border-gray-300 pl-10 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"
          autoComplete="off"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {isLoading && <li className="cursor-default select-none py-2 px-4 text-gray-700">Buscando...</li>}
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="relative cursor-pointer select-none py-2 px-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// --- Función de Ayuda: Debounce (sin cambios) ---
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// --- Componente Principal de la Página (sin cambios) ---
function NewSurgeryPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState(() => ({
    patient_name: searchParams.get('patient_name') || '',
    doctor_name: searchParams.get('doctor_name') || '',
    institution: searchParams.get('institution') || '',
    client: searchParams.get('client') || '',
    surgery_date: searchParams.get('surgery_date') || '',
    provider: '',
    initial_note: ''
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialToAdd, setMaterialToAdd] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteData, setNoteData] = useState({ description: '', quantity: 1, observations: '' });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRework, setIsRework] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAutocompleteChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchDoctors = async (term) => {
    const { data, error } = await supabase.rpc('get_distinct_doctors', { search_term: term });
    return error ? [] : data;
  };

  const fetchInstitutions = async (term) => {
    const { data, error } = await supabase.rpc('get_distinct_institutions', { search_term: term });
    return error ? [] : data;
  };

  const fetchClients = async (term) => {
    const { data, error } = await supabase.rpc('get_distinct_clients', { search_term: term });
    return error ? [] : data;
  };

  const fetchProviders = async (term) => {
    const { data, error } = await supabase
      .from('providers')
      .select('name')
      .ilike('name', `%${term}%`)
      .limit(10);
    return error ? [] : data;
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
  
  const handleNewMaterialCreated = (newMaterial) => {
    handleSelectMaterial(newMaterial);
  };

  const handleConfirmAddMaterial = () => {
    if (!materialToAdd) return;
    if (quantity < 1) {
      toast.error("La cantidad debe ser al menos 1.");
      return;
    }
    if (!selectedMaterials.find(m => m.type === 'formal' && m.material_id === materialToAdd.id)) {
      setSelectedMaterials([...selectedMaterials, { 
        id: materialToAdd.id,
        material_id: materialToAdd.id,
        name: materialToAdd.name,
        code: materialToAdd.code,
        quantity_requested: quantity, 
        observations: observations, 
        type: 'formal',
        free_text_description: null
      }]);
    } else {
      toast.error("Este material ya ha sido agregado al pedido.");
    }
    setMaterialToAdd(null);
    setQuantity(1);
    setObservations('');
  };

  const handleConfirmAddNote = () => {
    if (!noteData.description.trim()) {
      toast.error("La descripción de la nota no puede estar vacía.");
      return;
    }
    if (noteData.quantity < 1) {
      toast.error("La cantidad debe ser al menos 1.");
      return;
    }
    const newNote = {
      id: `note_${Date.now()}`,
      material_id: null,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMaterials.length === 0) {
      toast.error('Debe agregar al menos un material al pedido.');
      return;
    }
    if (!formData.patient_name || !formData.surgery_date) {
      toast.error('Nombre del Paciente y Fecha de Cirugía son campos obligatorios.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creando pedido...');

    try {
      let providerId = null;
      if (formData.provider && formData.provider.trim() !== '') {
        const { data: pid, error: providerError } = await supabase.rpc('get_or_create_provider', {
          provider_name: formData.provider.trim()
        });
        if (providerError) throw new Error(`Error con el proveedor: ${providerError.message}`);
        providerId = pid;
      }

      const surgeryPayload = {
        patient_name: formData.patient_name,
        doctor_name: formData.doctor_name,
        institution: formData.institution,
        client: formData.client,
        surgery_date: formData.surgery_date,
        provider_id: providerId,
        provider: null
      };
      
      const materialsPayload = selectedMaterials.map(m => ({
        material_id: m.material_id,
        quantity_requested: m.quantity_requested,
        observations: m.observations,
        free_text_description: m.free_text_description,
      }));

      const { error } = await supabase.rpc('create_surgery_with_details', {
        surgery_details: surgeryPayload,
        materials: materialsPayload,
        initial_note: formData.initial_note,
        is_urgent_flag: isUrgent,
        is_rework_flag: isRework,
      });

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success('¡Pedido creado con éxito!');
      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      console.error('Error al crear el pedido:', error);
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CreateMaterialModal isOpen={isCreateMaterialModalOpen} onClose={() => setIsCreateMaterialModalOpen(false)} onSave={handleNewMaterialCreated} />
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Crear Nuevo Pedido</h1>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Volver al Pipeline</Link>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 bg-white rounded-xl shadow-lg space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">Nombre del Paciente <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input type="text" name="patient_name" id="patient_name" required value={formData.patient_name} onChange={handleChange} className="block w-full rounded-md border-gray-300 pl-10 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition" placeholder="Ej: Juan Pérez"/>
                </div>
              </div>
              <AutocompleteInput label="Médico Tratante" value={formData.doctor_name} onValueChange={(val) => handleAutocompleteChange('doctor_name', val)} fetchSuggestions={fetchDoctors} placeholder="Escriba para buscar..." icon={BriefcaseIcon}/>
              <AutocompleteInput label="Institución" value={formData.institution} onValueChange={(val) => handleAutocompleteChange('institution', val)} fetchSuggestions={fetchInstitutions} placeholder="Escriba para buscar..." icon={BuildingOffice2Icon}/>
              <AutocompleteInput label="Cliente" value={formData.client} onValueChange={(val) => handleAutocompleteChange('client', val)} fetchSuggestions={fetchClients} placeholder="Escriba para buscar..." icon={BriefcaseIcon}/>
            </div>
            
            <div className="border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div><label htmlFor="surgery_date" className="block text-sm font-medium text-gray-700">Fecha de Cirugía <span className="text-red-500">*</span></label><input type="date" name="surgery_date" id="surgery_date" required value={formData.surgery_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"/></div>
              <AutocompleteInput 
                label="Proveedor a Solicitar" 
                value={formData.provider} 
                onValueChange={(val) => handleAutocompleteChange('provider', val)} 
                fetchSuggestions={fetchProviders} 
                placeholder="Escriba para buscar o crear..." 
                icon={TruckIcon}
              />
              <div className="md:col-span-2"><label htmlFor="initial_note" className="block text-sm font-medium text-gray-700">Novedad o Nota Inicial (Opcional)</label><textarea name="initial_note" id="initial_note" rows="3" value={formData.initial_note} onChange={handleChange} placeholder="Añadir detalles importantes, instrucciones de entrega, etc." className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"></textarea></div>
              
              <div className="md:col-span-2 flex items-center space-x-6">
                <div className="flex items-center space-x-2"><input id="is_urgent" name="is_urgent" type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="is_urgent" className="font-medium text-gray-700">Marcar como Pedido Urgente</label></div>
                <div className="flex items-center space-x-2"><input id="is_rework" name="is_rework" type="checkbox" checked={isRework} onChange={(e) => setIsRework(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="is_rework" className="font-medium text-gray-700">Marcar como Reproceso</label></div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Materiales Solicitados</h3>
              
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="search_material" className="block text-sm font-medium text-gray-700">1. Buscar Material por código o nombre</label>
                  <button type="button" onClick={() => setIsCreateMaterialModalOpen(true)} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                    + Crear Nuevo
                  </button>
                </div>
                <input type="text" id="search_material" value={searchTerm} onChange={handleSearchChange} placeholder="Escriba para buscar..." className="block w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"/>
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
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Material</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cantidad</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Observaciones</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Eliminar</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedMaterials.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-10 text-center">
                              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-semibold text-gray-900">Sin materiales</h3>
                              <p className="mt-1 text-sm text-gray-500">Comience buscando un material para añadirlo al pedido.</p>
                            </td>
                          </tr>
                        ) : (
                          selectedMaterials.map((m, index) => (
                            <tr key={m.id} className={index % 2 === 0 ? undefined : 'bg-gray-50'}>
                              <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">{m.type === 'formal' ? (<><div className="font-medium text-gray-900">{m.name}</div><div className="text-gray-500">{m.code || 'Sin código'}</div></>) : (<div className="italic text-orange-700"><div className="font-medium">{m.free_text_description}</div><div className="text-xs font-normal">(Nota provisoria)</div></div>)}</td>
                              <td className="px-3 py-4 text-sm font-medium text-gray-900">{m.quantity_requested}</td>
                              <td className="px-3 py-4 text-sm text-gray-500">{m.observations || '-'}</td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"><button type="button" onClick={() => handleRemoveMaterial(m.id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Eliminar</button></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-4">
              <Link href="/dashboard" className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-200 ease-in-out hover:scale-105">Cancelar</Link>
              <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isLoading ? 'Guardando...' : 'Crear Pedido'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

// --- Componente de Ayuda: Suspense Wrapper ---
export default function NewSurgeryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gray-700">Cargando formulario...</div>}>
      <NewSurgeryPageContent />
    </Suspense>
  );
}