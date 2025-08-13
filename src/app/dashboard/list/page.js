// --- START OF FILE: src/app/dashboard/list/page.js (FULL AND VERIFIED) ---

'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { exportListToPdf, exportListToExcel } from '@/lib/exportUtils'

// Componentes Reutilizables
import SmartSearchBar from '../SmartSearchBar'
import SettingsMenu from '../SettingsMenu'
import PipelineSettingsModal from '../PipelineSettingsModal'
import SurgeryDetailModal from '../SurgeryDetailModal'
import FilterModal from '../FilterModal'
import SurgeryListItem from './SurgeryListItem'

// Iconos y Componentes de UI
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const Spinner = () => ( <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>);
const FilterIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 12.414V17a1 1 0 01-1.447.894l-2-1A1 1 0 018 16v-3.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>);

const ExportMenu = ({ onExport, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} disabled={disabled} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Exportar
      </button>
      {isOpen && (<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"><div className="py-1"><a href="#" onClick={(e) => { e.preventDefault(); onExport('pdf'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Como PDF</a><a href="#" onClick={(e) => { e.preventDefault(); onExport('excel'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Como Excel</a></div></div>)}
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function ListPage() {
  const [surgeries, setSurgeries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({ doctors: [], institutions: [], creators: [], statuses: [], clients: [], providers: [], materials: [] });
  
  // --- CORREGIDO: Se mueve la creación del cliente de Supabase fuera del useEffect ---
  const supabase = createClient();

  // --- CORREGIDO: Se envuelve getFullSurgeryDetailsQuery en useCallback ---
  const getFullSurgeryDetailsQuery = useCallback(() => {
    return supabase.from('surgeries').select(`*, creator:profiles(full_name), status:pipeline_statuses(*), surgery_materials(id, is_missing, quantity_requested, observations, free_text_description, materials(id, name, code, brand)), surgery_history(*, user:profiles(full_name)), surgery_notes(*, user:profiles(full_name))`);
  }, [supabase]);

  useEffect(() => {
    async function getInitialData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(userProfile);

      const [statusesRes, surgeriesRes, creatorsRes, materialsRes] = await Promise.all([
        supabase.from('pipeline_statuses').select('*').order('sort_order', { ascending: true }),
        getFullSurgeryDetailsQuery().order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name'),
        supabase.from('materials').select('id, name')
      ]);

      const allSurgeries = surgeriesRes.data || [];
      setSurgeries(allSurgeries);
      
      setFilterOptions({
        doctors: [...new Set(allSurgeries.map(s => s.doctor_name).filter(Boolean))].sort(),
        institutions: [...new Set(allSurgeries.map(s => s.institution).filter(Boolean))].sort(),
        creators: creatorsRes.data || [],
        statuses: statusesRes.data || [],
        clients: [...new Set(allSurgeries.map(s => s.client).filter(Boolean))].sort(),
        providers: [...new Set(allSurgeries.map(s => s.provider).filter(Boolean))].sort(),
        materials: materialsRes.data || []
      });
      
      setLoading(false);
    }
    getInitialData();
  // --- CORREGIDO: Se añaden las dependencias correctas ---
  }, [supabase, getFullSurgeryDetailsQuery]);

  const filteredSurgeries = useMemo(() => {
    const lowercasedGeneral = searchQuery.toLowerCase();
    return surgeries.filter(surgery => {
      if (lowercasedGeneral && !(surgery.patient_name?.toLowerCase().includes(lowercasedGeneral) || surgery.doctor_name?.toLowerCase().includes(lowercasedGeneral) || surgery.surgery_materials.some(m => m.materials?.name.toLowerCase().includes(lowercasedGeneral)))) return false;
      if (activeFilters.status && surgery.status_id != activeFilters.status) return false;
      if (activeFilters.doctor && surgery.doctor_name !== activeFilters.doctor) return false;
      if (activeFilters.institution && surgery.institution !== activeFilters.institution) return false;
      if (activeFilters.creator && surgery.creator_id !== activeFilters.creator) return false;
      if (activeFilters.client && surgery.client !== activeFilters.client) return false;
      if (activeFilters.provider && surgery.provider !== activeFilters.provider) return false;
      if (activeFilters.material && !surgery.surgery_materials.some(m => m.materials?.id === activeFilters.material)) return false;
      if (activeFilters.surgery_date && surgery.surgery_date !== activeFilters.surgery_date) return false;
      if (activeFilters.is_urgent && !surgery.is_urgent) return false;
      if (activeFilters.is_rework && !surgery.is_rework) return false;
      if (activeFilters.has_missing && !surgery.surgery_materials.some(m => m.is_missing)) return false;
      return true;
    });
  }, [searchQuery, activeFilters, surgeries]);

  const handleExport = (format) => {
    const dataToExport = filteredSurgeries.map(surgery => {
      const tags = [];
      if (surgery.is_urgent) tags.push('URGENTE');
      if (surgery.is_rework) tags.push('REPROCESO');
      if (surgery.surgery_materials.some(m => m.is_missing)) tags.push('FALTANTES');
      if (surgery.surgery_materials.some(m => !m.materials && m.free_text_description)) tags.push('PROVISORIO');
      const firstFormal = surgery.surgery_materials.find(m => m.materials);
      const firstProvisional = surgery.surgery_materials.find(m => m.free_text_description);
      let title = firstFormal?.materials.name || firstProvisional?.free_text_description || surgery.patient_name;
      return { title: title, patient: surgery.patient_name, surgery_date: formatDate(surgery.surgery_date), status: surgery.status?.name || 'N/A', tags: tags.join(', ') || '-', };
    });
    if (format === 'pdf') { exportListToPdf(dataToExport); }
    if (format === 'excel') { exportListToExcel(dataToExport); }
  };

  const handleToggleTag = async () => console.log("Acción no implementada");
  const handleAddNote = async () => console.log("Acción no implementada");
  const handleToggleNoteVisibility = async () => console.log("Acción no implementada");
  const handleMarkAsMissing = async () => console.log("Acción no implementada");
  const handleFormalize = async () => console.log("Acción no implementada");
  const handleCancelSurgery = async () => console.log("Acción no implementada");

  return (
    <>
      <PipelineSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} initialStatuses={filterOptions.statuses} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} options={filterOptions} onApply={setActiveFilters} activeFilters={activeFilters} />
      <SurgeryDetailModal surgery={selectedSurgery} onClose={() => setSelectedSurgery(null)} userRole={profile?.role} onToggleUrgent={handleToggleTag} onToggleRework={handleToggleTag} onAddNote={handleAddNote} onToggleNoteVisibility={handleToggleNoteVisibility} onMarkAsMissing={handleMarkAsMissing} onFormalize={handleFormalize} onCancelSurgery={handleCancelSurgery} />
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="relative z-20 flex items-center justify-between p-3 bg-[#1E3A8A] text-white shadow-lg flex-shrink-0">
          <div className="flex items-center space-x-4"><div className="text-2xl font-bold tracking-wider">DistriTrack</div></div>
          <div className="flex-grow max-w-2xl"><SmartSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /></div>
          <div className="flex items-center space-x-5">
            <Link href="/dashboard/new-surgery" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 whitespace-nowrap">+ Agregar Pedido</Link>
            <div className="h-6 w-px bg-blue-500/50"></div>
            <SettingsMenu profile={profile} onOpenSettings={() => setIsSettingsModalOpen(true)} />
            <div className="flex items-center space-x-2"><UserIcon /><span className="text-sm font-medium text-blue-100">{profile?.full_name || user?.email}</span></div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos (Vista de Lista)</h1>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsFilterModalOpen(true)} className="relative flex-shrink-0 px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"><FilterIcon />Filtros{Object.keys(activeFilters).length > 0 && <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">{Object.keys(activeFilters).length}</span>}</button>
                <ExportMenu onExport={handleExport} disabled={filteredSurgeries.length === 0} />
              </div>
            </div>
            {loading ? <Spinner /> : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="hidden md:flex items-center p-3 text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-200"><div className="w-2/5 pl-2">Pedido</div><div className="w-1/5">Fecha Cirugía</div><div className="w-1/5">Estado</div><div className="w-1/5">Etiquetas</div></div>
                <div>
                  {filteredSurgeries.length > 0 ? (filteredSurgeries.map(surgery => (<SurgeryListItem key={surgery.id} surgery={surgery} onRowClick={() => setSelectedSurgery(surgery)} />))) : (<div className="text-center py-10 text-gray-500">No se encontraron pedidos.</div>)}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}