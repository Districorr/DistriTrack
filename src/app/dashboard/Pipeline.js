'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { DndContext, useDroppable, DragOverlay } from '@dnd-kit/core'
import { DraggableSurgeryCard } from './DraggableSurgeryCard'
import { SurgeryCard } from './SurgeryCard'
import SurgeryDetailModal from './SurgeryDetailModal'
import { createClient } from '@/lib/supabase/client'

function PipelineColumn({ status, surgeries, isAdmin, onCardClick }) {
  const { setNodeRef } = useDroppable({ id: status.id });
  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 bg-gray-200 rounded-lg shadow-sm">
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">{status.name}</h2>
          <span className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-300 rounded-full">{surgeries.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-1">
          {surgeries.map(surgery => (
            <DraggableSurgeryCard 
              key={surgery.id} 
              surgery={surgery} 
              isAdmin={isAdmin} 
              onCardClick={onCardClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pipeline({ statuses, initialSurgeries, userRole, searchTerm }) {
  const [surgeries, setSurgeries] = useState(initialSurgeries || []);
  const [activeSurgery, setActiveSurgery] = useState(null);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const isAdmin = userRole === 'admin';
  const supabase = createClient();
  const pipelineContainerRef = useRef(null);

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { setSurgeries(initialSurgeries || []); }, [initialSurgeries]);

  const filteredSurgeries = useMemo(() => {
    if (!searchTerm) return surgeries;
    const lowercasedFilter = searchTerm.toLowerCase();
    return surgeries.filter(surgery => {
      const searchInSurgery = surgery.patient_name?.toLowerCase().includes(lowercasedFilter) || surgery.doctor_name?.toLowerCase().includes(lowercasedFilter) || surgery.institution?.toLowerCase().includes(lowercasedFilter);
      const searchInMaterials = surgery.surgery_materials.some(item => 
        item.materials?.name.toLowerCase().includes(lowercasedFilter) || 
        item.materials?.code.toLowerCase().includes(lowercasedFilter) ||
        item.free_text_description?.toLowerCase().includes(lowercasedFilter)
      );
      return searchInSurgery || searchInMaterials;
    });
  }, [searchTerm, surgeries]);

  const handleMarkAsMissing = async (surgeryMaterialId, surgeryId) => {
    const { error } = await supabase.from('surgery_materials').update({ is_missing: true }).eq('id', surgeryMaterialId);
    if (error) {
      alert('Error al marcar como faltante.');
      console.error(error);
    } else {
      const { data: updatedSurgery } = await supabase.from('surgeries').select(`*, creator:profiles(full_name), status:pipeline_statuses(id, name, color), surgery_materials(id, is_missing, quantity_requested, observations, free_text_description, materials(name, code, brand)), surgery_history(*, user:profiles(full_name))`).eq('id', surgeryId).single();
      setSelectedSurgery(updatedSurgery);
      setSurgeries(prev => prev.map(s => s.id === surgeryId ? updatedSurgery : s));
    }
  };

  async function handleDragEnd(event) {
    setActiveSurgery(null);
    const { active, over } = event;
    if (!over) return;
    const surgeryId = active.id;
    const newStatusId = over.id;
    const currentSurgery = surgeries.find(s => s.id === surgeryId);
    if (currentSurgery && currentSurgery.status_id !== newStatusId) {
      const updatedSurgeriesList = surgeries.map(s => s.id === surgeryId ? { ...s, status_id: newStatusId } : s);
      setSurgeries(updatedSurgeriesList);
      const { error } = await supabase.from('surgeries').update({ status_id: newStatusId }).eq('id', surgeryId);
      if (error) {
        console.error('Error updating surgery status:', error);
        setSurgeries(initialSurgeries);
        alert('Hubo un error al actualizar el estado.');
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const oldStatus = statuses.find(s => s.id === currentSurgery.status_id);
          const newStatus = statuses.find(s => s.id === newStatusId);
          if (user && oldStatus && newStatus) {
            await supabase.from('surgery_history').insert({ surgery_id: surgeryId, user_id: user.id, change_description: `Estado cambiado de "${oldStatus.name}" a "${newStatus.name}".`, details: { action: 'status_change', from: oldStatus.name, to: newStatus.name } });
          }
        } catch (historyError) { console.error("Error al guardar en el historial:", historyError); }
      }
    }
  }

  const handleCancelSurgery = async (surgeryId, reason) => {
    const cancelStatus = statuses.find(s => s.name === 'Cancelado');
    if (!cancelStatus) {
      alert('Error: No se encontró el estado "Cancelado". Por favor, créelo en la configuración.');
      return;
    }
    const { error } = await supabase.from('surgeries').update({ status_id: cancelStatus.id }).eq('id', surgeryId);
    if (error) {
      alert('Error al cancelar el pedido.');
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('surgery_history').insert({ surgery_id: surgeryId, user_id: user.id, change_description: `Pedido cancelado. Motivo: ${reason || 'No especificado'}.` });
      const updatedSurgeries = surgeries.map(s => s.id === surgeryId ? { ...s, status_id: cancelStatus.id } : s);
      setSurgeries(updatedSurgeries);
    }
  };

  const handleFormalize = async (surgeryMaterialId, description) => {
    const materialCode = prompt(`Asignar código a: "${description}".\n\nPor favor, ingrese el CÓDIGO exacto del material en el catálogo:`);
    if (!materialCode || !materialCode.trim()) {
      return;
    }
    try {
      const { data: material, error: findError } = await supabase.from('materials').select('id').eq('code', materialCode.trim()).single();
      if (findError || !material) {
        alert('Error: No se encontró ningún material con ese código. Verifique el código e intente de nuevo.');
        return;
      }
      const { error: updateError } = await supabase.from('surgery_materials').update({ material_id: material.id, free_text_description: null }).eq('id', surgeryMaterialId);
      if (updateError) throw updateError;
      alert('¡Material asignado con éxito! La vista se refrescará para mostrar los cambios.');
      window.location.reload();
    } catch (error) {
      alert(`Error al asignar el material: ${error.message}`);
      console.error(error);
    }
  };

  const scroll = (scrollOffset) => {
    if (pipelineContainerRef.current) {
      pipelineContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  if (!isClient) return null;

  return (
    <>
      <SurgeryDetailModal 
        surgery={selectedSurgery} 
        onClose={() => setSelectedSurgery(null)} 
        userRole={userRole} 
        onMarkAsMissing={handleMarkAsMissing}
        onCancelSurgery={handleCancelSurgery}
        onFormalize={handleFormalize}
      />
      <div className="relative h-full">
        <DndContext onDragStart={(e) => setActiveSurgery(e.active.data.current?.surgery || null)} onDragEnd={handleDragEnd}>
          <div ref={pipelineContainerRef} className="flex space-x-4 h-full overflow-x-auto pb-4 scrollbar-hide">
            {statuses.map(status => (
              <PipelineColumn
                key={status.id}
                status={status}
                surgeries={filteredSurgeries.filter(s => s.status_id === status.id)}
                isAdmin={isAdmin}
                onCardClick={setSelectedSurgery}
              />
            ))}
          </div>
          <DragOverlay>
            {activeSurgery ? <div className="shadow-2xl rounded-lg"><SurgeryCard surgery={activeSurgery} /></div> : null}
          </DragOverlay>
        </DndContext>
        <button onClick={() => scroll(-400)} className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scroll(400)} className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
}