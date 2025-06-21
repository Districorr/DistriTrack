'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import LogoutButton from '../LogoutButton'
import SurgeryListItem from './SurgeryListItem'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Función de formato de fecha
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Componente de UI para el Spinner de Carga
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Componente de UI para el Menú de Exportación
const ExportMenu = ({ onExport, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        disabled={disabled}
        className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        Exportar
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <a href="#" onClick={(e) => { e.preventDefault(); onExport('xlsx'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Como Excel (.xlsx)</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onExport('pdf'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Como PDF (.pdf)</a>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal de la Página ---
export default function ListPage() {
  const [surgeries, setSurgeries] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const supabase = createClient();

  const getInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setUserRole(profile?.role);

    const { data: statusesData } = await supabase.from('pipeline_statuses').select('*').order('sort_order');
    setAllStatuses(statusesData || []);

    const { data: surgeriesData } = await supabase.from('surgeries').select(`*, creator:profiles(full_name), status:pipeline_statuses(id, name, color), surgery_materials(id, materials(name, code))`);
    setSurgeries(surgeriesData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const handleStatusChange = async (surgeryId, newStatusId) => {
    setSurgeries(current => current.map(s => s.id === surgeryId ? { ...s, status_id: newStatusId, status: allStatuses.find(st => st.id == newStatusId) } : s));
    const { error } = await supabase.from('surgeries').update({ status_id: newStatusId }).eq('id', surgeryId);
    if (error) {
      alert('Error al actualizar el estado.');
      getInitialData();
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const oldStatus = surgeries.find(s => s.id === surgeryId)?.status?.name;
      const newStatus = allStatuses.find(st => st.id == newStatusId)?.name;
      if (user && oldStatus && newStatus) {
        await supabase.from('surgery_history').insert({ surgery_id: surgeryId, user_id: user.id, change_description: `Estado cambiado desde la lista de "${oldStatus}" a "${newStatus}".` });
      }
    }
  };

  const filteredSurgeries = useMemo(() => {
    return surgeries
      .filter(surgery => statusFilter === 'all' || surgery.status?.id == statusFilter)
      .filter(surgery => {
        if (!searchTerm) return true;
        const lowercasedFilter = searchTerm.toLowerCase();
        const searchInSurgery = surgery.patient_name?.toLowerCase().includes(lowercasedFilter) || surgery.doctor_name?.toLowerCase().includes(lowercasedFilter);
        const searchInMaterials = surgery.surgery_materials.some(item => item.materials?.name.toLowerCase().includes(lowercasedFilter) || item.materials?.code.toLowerCase().includes(lowercasedFilter));
        return searchInSurgery || searchInMaterials;
      });
  }, [surgeries, searchTerm, statusFilter]);

  const handleExport = (format) => {
    const dataToExport = filteredSurgeries.map(surgery => ({
      'Fecha CX': formatDate(surgery.surgery_date),
      'Paciente': surgery.patient_name,
      'Médico': surgery.doctor_name,
      'Institución': surgery.institution,
      'Estado': surgery.status?.name,
      'Creado por': surgery.creator?.full_name,
    }));

    const date = new Date().toISOString().split('T')[0];

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
      XLSX.writeFile(workbook, `Reporte_Pedidos_${date}.xlsx`);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de Pedidos - DistriTrack", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 14, 29);

      autoTable(doc, {
        head: [['Fecha CX', 'Paciente', 'Médico', 'Institución', 'Estado', 'Creado por']],
        body: dataToExport.map(Object.values),
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { font: 'helvetica', fontSize: 9 },
      });

      doc.save(`Reporte_Pedidos_${date}.pdf`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div className="text-2xl font-bold text-gray-900">DistriTrack</div>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 whitespace-nowrap">Ver Pipeline</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-800 hidden md:inline">{user?.email || 'Cargando...'}</span>
          <LogoutButton />
        </div>
      </header>
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <div className="flex items-center space-x-2">
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              {userRole === 'admin' && (
                <ExportMenu onExport={handleExport} disabled={filteredSurgeries.length === 0} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filtrar por estado:</span>
            <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === 'all' ? 'bg-indigo-600 text-white font-semibold shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Todos</button>
            {allStatuses.map(status => (
              <button key={status.id} onClick={() => setStatusFilter(status.id)} className={`px-3 py-1 text-sm rounded-full transition-all duration-200 font-medium ${statusFilter == status.id ? 'ring-2 ring-offset-1 shadow-md' : 'hover:opacity-80'}`} style={{ backgroundColor: statusFilter == status.id ? status.color : status.color + '20', color: statusFilter == status.id ? 'white' : status.color, ringColor: status.color }}>
                {status.name}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div>
              <div className="text-sm text-gray-600 mb-4">
                Mostrando <span className="font-bold text-gray-900">{filteredSurgeries.length}</span> de <span className="font-bold text-gray-900">{surgeries.length}</span> pedidos.
              </div>
              <div className="space-y-2">
                <div className="hidden md:flex items-center p-4 text-xs font-bold text-gray-500 uppercase">
                  <div className="w-1/3">Material Principal</div>
                  <div className="w-1/4">Paciente</div>
                  <div className="w-1/4">Institución</div>
                  <div className="w-1/6 text-center">Estado</div>
                  <div className="w-auto pl-4"></div>
                </div>
                {filteredSurgeries.length > 0 ? (
                  filteredSurgeries.map(surgery => (
                    <SurgeryListItem key={surgery.id} surgery={surgery} allStatuses={allStatuses} onStatusChange={handleStatusChange} />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">No se encontraron pedidos que coincidan con los filtros.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}