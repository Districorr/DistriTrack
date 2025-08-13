// --- START OF FILE: src/app/dashboard/Pipeline.js (FULL, UNABRIDGED, WITH DISPLAY LIMIT LOGIC) ---

'use client'

import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { DndContext, useDroppable, DragOverlay } from '@dnd-kit/core'
import { DraggableSurgeryCard } from './DraggableSurgeryCard'
import { SurgeryCard } from './SurgeryCard'
import SurgeryDetailModal from './SurgeryDetailModal'
import PurchaseOrderModal from './PurchaseOrderModal'
import { createClient } from '@/lib/supabase/client'
import { exportPipelineToPdf, exportPipelineToExcel } from '@/lib/exportUtils'

// --- Componente de Ayuda: Conversor de Color HEX a RGBA (Completo) ---
const hexToRgba = (hex, alpha) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return 'rgba(107, 114, 128, 1)';
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
};

// --- Componente de Ayuda: Columna del Pipeline (Completo y Modificado) ---
function PipelineColumn({ status, surgeries, isAdmin, onCardClick, onColumnFilterClick, totalSurgeriesInStatus, onShowMore }) {
  const { setNodeRef } = useDroppable({ id: status.id });
  const hasMore = surgeries.length < totalSurgeriesInStatus;

  return (
    <div ref={setNodeRef} className="w-full md:w-72 flex-shrink-0 md:border-l md:border-gray-300 md:first:border-l-0">
      <div className="h-full flex flex-col bg-gray-100">
        <div 
          className="p-3 border-t-4"
          style={{ borderTopColor: hexToRgba(status.color, 1) }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800">{status.name}</h2>
            <div className="flex items-center space-x-2">
              <button onClick={() => onColumnFilterClick(status.name)} title={`Filtrar por "${status.name}"`} className="text-gray-400 hover:text-indigo-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-2-1A1 1 0 018 16v-3.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg></button>
              <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">{totalSurgeriesInStatus}</span>
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
          {hasMore && (
            <div className="p-2 text-center">
              <button 
                onClick={() => onShowMore(status.id)}
                className="w-full px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
              >
                Ver más ({totalSurgeriesInStatus - surgeries.length} restantes)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal: Pipeline (Completo y Modificado) ---
const Pipeline = forwardRef(({ statuses, initialSurgeries, userRole, filters, onColumnFilterClick }, ref) => {
  const [allSurgeries, setAllSurgeries] = useState(initialSurgeries || []);
  const [activeSurgery, setActiveSurgery] = useState(null);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const isAdmin = userRole === 'admin';
  const supabase = createClient();
  const pipelineContainerRef = useRef(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [dragEndEvent, setDragEndEvent] = useState(null);
  const [displayCounts, setDisplayCounts] = useState({});

  useEffect(() => {
    const initialCounts = {};
    statuses.forEach(status => {
      initialCounts[status.id] = status.display_limit || 10; // Usamos 10 como fallback si no hay límite
    });
    setDisplayCounts(initialCounts);
  }, [statuses]);

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
  useEffect(() => { setAllSurgeries(initialSurgeries || []); }, [initialSurgeries]);

  const filteredSurgeries = useMemo(() => {
    const lowercasedGeneral = filters.general?.toLowerCase();
    
    return allSurgeries.filter(surgery => {
      if (lowercasedGeneral) {
        const inGeneral = surgery.patient_name?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.doctor_name?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.institution?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.purchase_order_number?.toLowerCase().includes(lowercasedGeneral) ||
                        surgery.provider_data?.name?.toLowerCase().includes(lowercasedGeneral) ||
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
      if (filters.provider && surgery.provider_id !== filters.provider) return false;
      if (filters.material && !surgery.surgery_materials.some(m => m.materials?.id === filters.material)) return false;
      if (filters.surgery_date && surgery.surgery_date !== filters.surgery_date) return false;
      if (filters.is_urgent && !surgery.is_urgent) return false;
      if (filters.is_rework && !surgery.is_rework) return false;
      if (filters.has_missing && !surgery.surgery_materials.some(m => m.is_missing)) return false;

      return true;
    });
  }, [filters, allSurgeries]);

  const getFullSurgeryDetailsQuery = () => {
    return supabase.from('surgeries').select(`
      *, 
      creator:profiles(full_name, email), 
      provider_data:providers(id, name, color), 
      status:pipeline_statuses(*), 
      surgery_materials(id, is_missing, quantity_requested, observations, free_text_description, materials(name, code, brand)), 
      surgery_history(*, user:profiles(full_name)), 
      surgery_notes(*, user:profiles(full_name))
    `);
  };

  const handleUpdate = async () => {
    if (!selectedSurgery) return;
    
    const { data: refreshedSurgery, error } = await getFullSurgeryDetailsQuery()
      .eq('id', selectedSurgery.id)
      .single();

    if (error) {
      console.error("Error al refrescar la cirugía:", error);
      return;
    }

    if (refreshedSurgery) {
      setSelectedSurgery(refreshedSurgery);
      setAllSurgeries(prev => prev.map(s => s.id === refreshedSurgery.id ? refreshedSurgery : s));
    }
  };

  const completeStatusChange = async (surgeryId, newStatusId, poNumber = null) => {
    const currentSurgery = allSurgeries.find(s => s.id === surgeryId);
    const oldStatus = statuses.find(s => s.id === currentSurgery.status_id);
    const newStatus = statuses.find(s => s.id === newStatusId);

    const updatedSurgeryData = { 
        status_id: newStatusId,
        ...(poNumber && { purchase_order_number: poNumber })
    };
    const updatedSurgeriesList = allSurgeries.map(s => s.id === surgeryId ? { ...s, ...updatedSurgeryData } : s);
    setAllSurgeries(updatedSurgeriesList);

    const { error } = await supabase.from('surgeries').update(updatedSurgeryData).eq('id', surgeryId);

    if (error) {
      setAllSurgeries(initialSurgeries);
      alert('Hubo un error al actualizar el estado.');
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      let historyDescription = `Estado cambiado de "${oldStatus.name}" a "${newStatus.name}".`;
      if (poNumber) {
        historyDescription += ` Se asignó la OC: ${poNumber}.`;
      }
      if (user && oldStatus && newStatus) {
        await supabase.from('surgery_history').insert({ 
          surgery_id: surgeryId, 
          user_id: user.id, 
          change_description: historyDescription 
        });
      }
    }
  };

  async function handleDragEnd(event) {
    setActiveSurgery(null);
    const { active, over } = event;

    if (!over) return;

    const surgeryId = active.id;
    const newStatusId = over.id;
    const currentSurgery = allSurgeries.find(s => s.id === surgeryId);

    if (currentSurgery && currentSurgery.status_id !== newStatusId) {
      const destinationStatus = statuses.find(s => s.id === newStatusId);
      
      if (destinationStatus?.requires_purchase_order) {
        setDragEndEvent(event);
        setIsPoModalOpen(true);
      } else {
        completeStatusChange(surgeryId, newStatusId);
      }
    }
  }

  const handlePoSubmit = (poNumber) => {
    if (dragEndEvent) {
      const { active, over } = dragEndEvent;
      completeStatusChange(active.id, over.id, poNumber);
    }
    setIsPoModalOpen(false);
    setDragEndEvent(null);
  };

  const handleShowMore = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    const increment = status?.display_limit || 10; // Incrementa por el límite o 10 por defecto
    
    setDisplayCounts(prevCounts => ({
      ...prevCounts,
      [statusId]: (prevCounts[statusId] || 0) + increment
    }));
  };

  const handleCancelSurgery = async (reason) => {
    if (!selectedSurgery) return;
    const surgeryId = selectedSurgery.id;

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
      const updatedSurgeries = allSurgeries.map(s => s.id === surgeryId ? { ...s, status_id: cancelStatus.id } : s);
      setAllSurgeries(updatedSurgeries);
    }
  };

  const goToNextColumn = () => {
    setActiveColumnIndex(prevIndex => Math.min(prevIndex + 1, statuses.length - 1));
  };
  const goToPrevColumn = () => {
    setActiveColumnIndex(prevIndex => Math.max(prevIndex - 1, 0));
  };

  if (!isClient) return null;

  return (
    <>
      <SurgeryDetailModal 
        surgery={selectedSurgery} 
        onClose={() => setSelectedSurgery(null)} 
        userRole={userRole} 
        onUpdate={handleUpdate}
        onCancelSurgery={handleCancelSurgery}
      />
      <PurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => { setIsPoModalOpen(false); setDragEndEvent(null); }}
        onSubmit={handlePoSubmit}
        statusName={dragEndEvent ? statuses.find(s => s.id === dragEndEvent.over.id)?.name : ''}
      />
      <div className="relative h-full">
        <DndContext onDragStart={(e) => setActiveSurgery(e.active.data.current?.surgery || null)} onDragEnd={handleDragEnd}>
          <div ref={pipelineContainerRef} className="h-full overflow-hidden md:overflow-x-auto md:pb-4 md:scrollbar-hide">
            <div 
              className="h-full flex transition-transform duration-300 ease-in-out md:transform-none"
              style={{ transform: `translateX(-${activeColumnIndex * 100}%)` }}
            >
              {statuses.map(status => {
                const surgeriesInStatus = filteredSurgeries.filter(s => s.status_id === status.id);
                const displayedCount = displayCounts[status.id] || 10;
                const surgeriesToDisplay = surgeriesInStatus.slice(0, displayedCount);

                return (
                  <PipelineColumn
                    key={status.id}
                    status={status}
                    surgeries={surgeriesToDisplay}
                    totalSurgeriesInStatus={surgeriesInStatus.length}
                    isAdmin={isAdmin}
                    onCardClick={setSelectedSurgery}
                    onColumnFilterClick={onColumnFilterClick}
                    onShowMore={handleShowMore}
                  />
                );
              })}
            </div>
          </div>
          <DragOverlay>{activeSurgery ? <div className="shadow-2xl rounded-lg"><SurgeryCard surgery={activeSurgery} /></div> : null}</DragOverlay>
        </DndContext>
        
        <button onClick={goToPrevColumn} disabled={activeColumnIndex === 0} className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110 disabled:opacity-0 md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={goToNextColumn} disabled={activeColumnIndex === statuses.length - 1} className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110 disabled:opacity-0 md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
});

Pipeline.displayName = "Pipeline";
export default Pipeline;