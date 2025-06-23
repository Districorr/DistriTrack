// --- START OF FILE: src/app/dashboard/Pipeline.js (FULL, VERIFIED, AND UNABRIDGED) ---

'use client'

import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { DndContext, useDroppable, DragOverlay } from '@dnd-kit/core'
import { DraggableSurgeryCard } from './DraggableSurgeryCard'
import { SurgeryCard } from './SurgeryCard'
import SurgeryDetailModal from './SurgeryDetailModal'
import { createClient } from '@/lib/supabase/client'
import { exportPipelineToPdf, exportPipelineToExcel } from '@/lib/exportUtils'

// --- Función de ayuda para convertir HEX a RGBA, previene errores de renderizado ---
const hexToRgba = (hex, alpha) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return 'rgba(107, 114, 128, 1)'; // Devuelve un gris por defecto si el HEX es inválido
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
};

function PipelineColumn({ status, surgeries, isAdmin, onCardClick, onColumnFilterClick }) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 border-l border-gray-300 first:border-l-0">
      <div className="h-full flex flex-col bg-gray-100">
        <div 
          className="p-3 border-t-4"
          style={{ borderTopColor: hexToRgba(status.color, 1) }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800">{status.name}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onColumnFilterClick(status.name)} 
                title={`Filtrar por "${status.name}"`} 
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-2-1A1 1 0 018 16v-3.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">
                {surgeries.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
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

const Pipeline = forwardRef(({ statuses, initialSurgeries, userRole, filters, onColumnFilterClick }, ref) => {
  const [surgeries, setSurgeries] = useState(initialSurgeries || []);
  const [activeSurgery, setActiveSurgery] = useState(null);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const isAdmin = userRole === 'admin';
  const supabase = createClient();
  const pipelineContainerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    handleExport(format) {
      if (format === 'pdf') {
        exportPipelineToPdf(pipelineContainerRef.current);
      }
      if (format === 'excel') {
        const surgeriesWithStatus = filteredSurgeries.map(s => ({
          ...s,
          status: statuses.find(st => st.id === s.status_id)
        }));
        exportPipelineToExcel(surgeriesWithStatus);
      }
    }
  }));

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { setSurgeries(initialSurgeries || []); }, [initialSurgeries]);

  const filteredSurgeries = useMemo(() => {
    const lowercasedGeneral = filters.general?.toLowerCase();
    
    return surgeries.filter(surgery => {
      if (lowercasedGeneral) {
        const inGeneral = surgery.patient_name?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.doctor_name?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.institution?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.surgery_materials.some(item => 
                          item.materials?.name.toLowerCase().includes(lowercasedGeneral) || 
                          item.materials?.code.toLowerCase().includes(lowercasedGeneral) ||
                          item.free_text_description?.toLowerCase().includes(lowercasedGeneral)
                        );
        if (!inGeneral) return false;
      }

      if (filters.status && surgery.status_id != filters.status) return false;
      if (filters.doctor && surgery.doctor_name !== filters.doctor) return false;
      if (filters.institution && surgery.institution !== filters.institution) return false;
      if (filters.creator && surgery.creator_id !== filters.creator) return false;
      if (filters.client && surgery.client !== filters.client) return false;
      if (filters.provider && surgery.provider !== filters.provider) return false;
      if (filters.material && !surgery.surgery_materials.some(m => m.materials?.id === filters.material)) return false;
      if (filters.surgery_date && surgery.surgery_date !== filters.surgery_date) return false;
      if (filters.is_urgent && !surgery.is_urgent) return false;
      if (filters.is_rework && !surgery.is_rework) return false;
      if (filters.has_missing && !surgery.surgery_materials.some(m => m.is_missing)) return false;

      return true;
    });
  }, [filters, surgeries]);

  const getFullSurgeryDetailsQuery = () => {
    return supabase.from('surgeries').select(`*, creator:profiles(full_name), status:pipeline_statuses(*), surgery_materials(id, is_missing, quantity_requested, observations, free_text_description, materials(name, code, brand)), surgery_history(*, user:profiles(full_name)), surgery_notes(*, user:profiles(full_name))`);
  };

  const handleToggleTag = async (surgeryId, field, newValue, logMessage) => {
    const originalSurgery = surgeries.find(s => s.id === surgeryId);
    if (!originalSurgery) return;
    const updatedSurgery = { ...originalSurgery, [field]: newValue };
    setSelectedSurgery(updatedSurgery);
    setSurgeries(prev => prev.map(s => s.id === surgeryId ? updatedSurgery : s));
    const { error } = await supabase.from('surgeries').update({ [field]: newValue }).eq('id', surgeryId);
    if (error) {
      alert(`Error al actualizar el estado de "${logMessage}".`);
      setSelectedSurgery(originalSurgery);
      setSurgeries(prev => prev.map(s => s.id === surgeryId ? originalSurgery : s));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const description = `Pedido marcado como "${logMessage}"`;
      await supabase.from('surgery_history').insert({ surgery_id: surgeryId, user_id: user.id, change_description: description });
      const { data: refreshedSurgery } = await getFullSurgeryDetailsQuery().eq('id', surgeryId).single();
      if (refreshedSurgery) setSelectedSurgery(refreshedSurgery);
    }
  };

  const handleToggleUrgent = (surgeryId, newValue) => handleToggleTag(surgeryId, 'is_urgent', newValue, newValue ? 'Urgente' : 'No Urgente');
  const handleToggleRework = (surgeryId, newValue) => handleToggleTag(surgeryId, 'is_rework', newValue, newValue ? 'Reproceso' : 'No Reproceso');

  const handleMarkAsMissing = async (surgeryMaterialId, surgeryId) => {
    const { error } = await supabase.from('surgery_materials').update({ is_missing: true }).eq('id', surgeryMaterialId);
    if (error) {
      alert('Error al marcar como faltante.');
    } else {
      const { data: updatedSurgery } = await getFullSurgeryDetailsQuery().eq('id', surgeryId).single();
      if (updatedSurgery) {
        setSelectedSurgery(updatedSurgery);
        setSurgeries(prev => prev.map(s => s.id === surgeryId ? updatedSurgery : s));
      }
    }
  };

  const handleAddNote = async (surgeryId, content, isVisibleToAll) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('surgery_notes').insert({ surgery_id: surgeryId, user_id: user.id, content: content, is_visible_to_all: isVisibleToAll });
    if (error) {
      alert('Error al añadir la nota.');
    } else {
      const { data: refreshedSurgery } = await getFullSurgeryDetailsQuery().eq('id', surgeryId).single();
      if (refreshedSurgery) setSelectedSurgery(refreshedSurgery);
    }
  };

  const handleToggleNoteVisibility = async (noteId, newVisibility) => {
    const { error } = await supabase.from('surgery_notes').update({ is_visible_to_all: newVisibility }).eq('id', noteId);
    if (error) {
      alert('Error al cambiar la visibilidad de la nota.');
    } else {
      const { data: refreshedSurgery } = await getFullSurgeryDetailsQuery().eq('id', selectedSurgery.id).single();
      if (refreshedSurgery) setSelectedSurgery(refreshedSurgery);
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
        setSurgeries(initialSurgeries);
        alert('Hubo un error al actualizar el estado.');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const oldStatus = statuses.find(s => s.id === currentSurgery.status_id);
        const newStatus = statuses.find(s => s.id === newStatusId);
        if (user && oldStatus && newStatus) {
          await supabase.from('surgery_history').insert({ surgery_id: surgeryId, user_id: user.id, change_description: `Estado cambiado de "${oldStatus.name}" a "${newStatus.name}".`, details: { action: 'status_change', from: oldStatus.name, to: newStatus.name } });
        }
      }
    }
  }

  const handleCancelSurgery = async (surgeryId, reason) => {
    const cancelStatus = statuses.find(s => s.name === 'Cancelado');
    if (!cancelStatus) {
      alert('Error: No se encontró el estado "Cancelado".');
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
    if (!materialCode || !materialCode.trim()) return;
    try {
      const { data: material, error: findError } = await supabase.from('materials').select('id').eq('code', materialCode.trim()).single();
      if (findError || !material) {
        alert('Error: No se encontró ningún material con ese código.');
        return;
      }
      const { error: updateError } = await supabase.from('surgery_materials').update({ material_id: material.id, free_text_description: null }).eq('id', surgeryMaterialId);
      if (updateError) throw updateError;
      alert('¡Material asignado con éxito! La página se refrescará para mostrar los cambios.');
      window.location.reload();
    } catch (error) {
      alert(`Error al asignar el material: ${error.message}`);
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
        onToggleUrgent={handleToggleUrgent}
        onToggleRework={handleToggleRework}
        onAddNote={handleAddNote}
        onToggleNoteVisibility={handleToggleNoteVisibility}
      />
      <div className="relative h-full">
        <DndContext onDragStart={(e) => setActiveSurgery(e.active.data.current?.surgery || null)} onDragEnd={handleDragEnd}>
          <div ref={pipelineContainerRef} className="flex h-full overflow-x-auto pb-4 scrollbar-hide">
            {statuses.map(status => (
              <PipelineColumn
                key={status.id}
                status={status}
                surgeries={filteredSurgeries.filter(s => s.status_id === status.id)}
                isAdmin={isAdmin}
                onCardClick={setSelectedSurgery}
                onColumnFilterClick={onColumnFilterClick}
              />
            ))}
          </div>
          <DragOverlay>{activeSurgery ? <div className="shadow-2xl rounded-lg"><SurgeryCard surgery={activeSurgery} /></div> : null}</DragOverlay>
        </DndContext>
        <button onClick={() => scroll(-400)} className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => scroll(400)} className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </>
  );
});

Pipeline.displayName = "Pipeline";
export default Pipeline;