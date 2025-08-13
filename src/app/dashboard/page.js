// --- START OF FILE: src/app/dashboard/page.js (IMPORT FIX) ---

'use client'

// --- CORRECCIÓN CLAVE: Se añade 'useMemo' a la importación de React ---
import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Pipeline from './Pipeline'
import SmartSearchBar from './SmartSearchBar' 
import SettingsMenu from './SettingsMenu'
import PipelineSettingsModal from './PipelineSettingsModal'
import FilterModal from './FilterModal'
import MobileSearchModal from './MobileSearchModal'
import { exportToExcel, exportToPdf } from '@/lib/exportUtils'
import { Bell } from 'lucide-react'

// --- El resto del archivo se mantiene exactamente igual ---

const NotificationsBell = () => {
  const supabase = createClient();
  const [pendingReminders, setPendingReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchPendingReminders = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('reminders')
        .select('*, surgery:surgeries(patient_name)')
        .eq('is_completed', false)
        .lte('remind_at', now)
        .order('remind_at', { ascending: true });

      if (data) {
        setPendingReminders(data);
      }
    };
    fetchPendingReminders();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsCompleted = async (reminderId) => {
    const { error } = await supabase.from('reminders').update({ is_completed: true }).eq('id', reminderId);
    if (!error) {
      setPendingReminders(prev => prev.filter(r => r.id !== reminderId));
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full text-blue-200 hover:bg-blue-900/60 transition-colors">
        <Bell size={20} />
        {pendingReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {pendingReminders.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
          <div className="p-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-800">Recordatorios Pendientes</h4>
          </div>
          <div className="py-1 max-h-96 overflow-y-auto">
            {pendingReminders.length > 0 ? (
              pendingReminders.map(reminder => (
                <div key={reminder.id} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                  <p className="text-sm text-gray-800 font-medium">{reminder.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pedido: {reminder.surgery?.patient_name || 'Desconocido'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Fecha: {new Date(reminder.remind_at).toLocaleString('es-AR')}
                  </p>
                  <button onClick={() => markAsCompleted(reminder.id)} className="mt-2 text-xs text-indigo-600 hover:underline">
                    Marcar como visto
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">No tienes recordatorios pendientes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ExportMenu = ({ disabled, filteredSurgeries, allSurgeries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (action) => {
    setIsOpen(false);
    switch (action) {
      case 'excel':
        exportToExcel(allSurgeries);
        break;
      case 'pdf_filtered':
        exportToPdf(filteredSurgeries, 'Vista Actual');
        break;
      case 'pdf_all':
        exportToPdf(allSurgeries, 'Todos los Pedidos');
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} disabled={disabled} className="flex-shrink-0 px-4 py-2.5 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Exportar
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 uppercase">Exportar a PDF</div>
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf_filtered'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Vista Actual (Resumen)
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf_all'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Todos los Pedidos (Detallado)
            </a>
            <div className="border-t border-gray-200 my-1"></div>
            <div className="px-4 py-2 text-xs text-gray-500 uppercase">Exportar a Excel</div>
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport('excel'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Reporte Completo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>);
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

export default function DashboardPage() {
  const [statuses, setStatuses] = useState([]);
  const [allStatusesForSettings, setAllStatusesForSettings] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({ doctors: [], institutions: [], creators: [], statuses: [], clients: [], providers: [], materials: [] });

  const pipelineRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    async function getInitialData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(userProfile);

      const surgeriesQuery = supabase.from('surgeries').select(`
        *, 
        creator:profiles(full_name, email), 
        provider_data:providers(id, name, color), 
        status:pipeline_statuses(*), 
        surgery_materials(id, is_missing, quantity_requested, observations, free_text_description, materials(id, name, code, brand)), 
        surgery_history(*, user:profiles(full_name)), 
        surgery_notes(*, user:profiles(full_name))
      `)
      .order('surgery_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

      const [statusesRes, allStatusesRes, surgeriesRes, creatorsRes, materialsRes, providersRes] = await Promise.all([
        supabase.from('pipeline_statuses').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
        userProfile?.role === 'admin' ? supabase.from('pipeline_statuses').select('*').order('sort_order', { ascending: true }) : Promise.resolve({ data: [] }),
        surgeriesQuery,
        supabase.from('profiles').select('id, full_name'),
        supabase.from('materials').select('id, name'),
        supabase.from('providers').select('id, name')
      ]);

      setStatuses(statusesRes.data || []);
      setAllStatusesForSettings(allStatusesRes.data || []);
      const allSurgeries = surgeriesRes.data || [];
      setSurgeries(allSurgeries);

      const uniqueDoctors = [...new Set(allSurgeries.map(s => s.doctor_name).filter(Boolean))];
      const uniqueInstitutions = [...new Set(allSurgeries.map(s => s.institution).filter(Boolean))];
      const uniqueClients = [...new Set(allSurgeries.map(s => s.client).filter(Boolean))];
      
      setFilterOptions({
        doctors: uniqueDoctors.sort(),
        institutions: uniqueInstitutions.sort(),
        creators: creatorsRes.data || [],
        statuses: statusesRes.data || [],
        clients: uniqueClients.sort(),
        providers: providersRes.data || [],
        materials: materialsRes.data || []
      });
      
      setLoading(false);
    }
    getInitialData();
  }, []);

  const filteredSurgeries = useMemo(() => {
    const combinedFilters = { ...activeFilters, general: searchQuery };
    if (Object.keys(combinedFilters).length === 0) {
      return surgeries;
    }
    const lowercasedGeneral = combinedFilters.general?.toLowerCase();
    
    return surgeries.filter(surgery => {
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

      if (combinedFilters.status && surgery.status_id != combinedFilters.status) return false;
      return true;
    });
  }, [activeFilters, searchQuery, surgeries]);

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <>
      <PipelineSettingsModal initialStatuses={allStatusesForSettings} isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} options={filterOptions} onApply={setActiveFilters} activeFilters={activeFilters} />
      <MobileSearchModal isOpen={isMobileSearchOpen} onClose={() => setIsMobileSearchOpen(false)} onSearch={setSearchQuery} />

      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
        <header className="relative z-20 flex items-center justify-between p-2 sm:p-3 bg-[#1E3A8A] text-white shadow-lg flex-shrink-0">
          
          <div className="flex items-center">
            <div className="text-xl sm:text-2xl font-bold tracking-wider">DistriTrack</div>
          </div>
          
          <div className="hidden md:flex flex-grow max-w-2xl items-center space-x-2 ml-4">
            <SmartSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <button onClick={() => setIsFilterModalOpen(true)} className="relative flex-shrink-0 px-4 py-2.5 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              Filtros
              {activeFilterCount > 0 && ( <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs">{activeFilterCount}</span> )}
            </button>
            <ExportMenu 
              disabled={loading} 
              filteredSurgeries={filteredSurgeries}
              allSurgeries={surgeries}
            />
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={() => setIsMobileSearchOpen(true)} className="p-2 rounded-lg hover:bg-white/10 md:hidden"><SearchIcon /></button>
            <button onClick={() => setIsFilterModalOpen(true)} className="p-2 rounded-lg hover:bg-white/10 md:hidden"><FilterIcon /></button>

            <Link href="/dashboard/new-surgery" className="px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 whitespace-nowrap">
              + Agregar Pedido
            </Link>
            
            <div className="hidden sm:flex h-6 w-px bg-blue-500/50"></div>
            
            <NotificationsBell />
            
            <div className="hidden sm:flex items-center space-x-2">
              <UserIcon />
              <span className="text-sm font-medium text-blue-100">{profile?.full_name || user?.email}</span>
            </div>

            <SettingsMenu profile={profile} onOpenSettings={() => setIsSettingsModalOpen(true)} />
          </div>
        </header>
        
        <main className="flex-1 p-2 sm:p-4 overflow-y-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div></div>
          ) : (
            <Pipeline 
              ref={pipelineRef}
              statuses={statuses} 
              initialSurgeries={surgeries} 
              userRole={profile?.role}
              filters={{ ...activeFilters, general: searchQuery }} 
              onColumnFilterClick={(statusName) => setSearchQuery(`estado:"${statusName}"`)}
            />
          )}
        </main>
      </div>
    </>
  );
}