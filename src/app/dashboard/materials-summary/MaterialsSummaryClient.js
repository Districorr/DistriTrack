// --- START OF FILE: src/app/dashboard/materials-summary/MaterialsSummaryClient.js (FULL AND VERIFIED) ---

'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { exportSummaryToPdf, exportDetailsToExcel } from '@/lib/exportUtils';

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
      <button onClick={() => setIsOpen(!isOpen)} disabled={disabled} className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center">
        Exportar
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (<div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"><div className="py-1"><a href="#" onClick={(e) => { e.preventDefault(); onExport('summary_pdf'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Resumen como PDF</a><a href="#" onClick={(e) => { e.preventDefault(); onExport('details_excel'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Desglose como Excel (con colores)</a></div></div>)}
    </div>
  );
};

export default function MaterialsSummaryClient({ initialSummary, statuses }) {
  const [summaryData, setSummaryData] = useState(initialSummary);
  const [detailedSurgeries, setDetailedSurgeries] = useState([]);
  const [selectedStatusIds, setSelectedStatusIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- CORREGIDO: Se mueve la creación del cliente de Supabase fuera del useEffect ---
  const supabase = createClient();

  // --- CORREGIDO: Se envuelve la lógica de carga en un useCallback y se añaden dependencias al useEffect ---
  const fetchFilteredData = useCallback(async () => {
    setLoading(true);
    const filter = selectedStatusIds.length > 0 ? selectedStatusIds : null;
    const summaryPromise = supabase.rpc('get_material_summary', { status_ids_array: filter });
    let detailsQuery = supabase.from('surgeries').select('*, status:pipeline_statuses(*), surgery_materials(quantity_requested, materials(name, code))');
    if (filter) {
      detailsQuery = detailsQuery.in('status_id', filter);
    }
    const detailsPromise = detailsQuery;
    const [summaryRes, detailsRes] = await Promise.all([summaryPromise, detailsPromise]);
    if (summaryRes.error || detailsRes.error) {
      console.error("Error fetching data:", summaryRes.error || detailsRes.error);
      alert("No se pudo actualizar el resumen.");
    } else {
      setSummaryData(summaryRes.data || []);
      setDetailedSurgeries(detailsRes.data || []);
    }
    setLoading(false);
  }, [selectedStatusIds, supabase]);

  useEffect(() => {
    fetchFilteredData();
  }, [fetchFilteredData]);

  const handleExport = (format) => {
    const selectedStatuses = statuses.filter(s => selectedStatusIds.includes(s.id));
    if (format === 'summary_pdf') { exportSummaryToPdf(summaryData, selectedStatuses); }
    if (format === 'details_excel') { exportDetailsToExcel(detailedSurgeries, selectedStatuses); }
  };

  const handleStatusToggle = (statusId) => {
    setSelectedStatusIds(prev => prev.includes(statusId) ? prev.filter(id => id !== statusId) : [...prev, statusId]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Filtrar por Estado del Pedido:</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (<button key={status.id} onClick={() => handleStatusToggle(status.id)} className={`px-3 py-1 text-sm rounded-full transition-all duration-200 font-medium ${selectedStatusIds.includes(status.id) ? 'ring-2 ring-offset-1 shadow-md' : 'hover:opacity-80'}`} style={{ backgroundColor: selectedStatusIds.includes(status.id) ? status.color : `${status.color}20`, color: selectedStatusIds.includes(status.id) ? 'white' : status.color, ringColor: status.color }}>{status.name}</button>))}
          </div>
        </div>
        <div className="mt-4 md:mt-0"><ExportMenu onExport={handleExport} disabled={summaryData.length === 0 && detailedSurgeries.length === 0} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Total</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (<tr><td colSpan="3" className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></td></tr>) : summaryData.length > 0 ? (summaryData.map(item => (<tr key={item.material_id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material_name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.material_code}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{item.total_quantity}</td></tr>))) : (<tr><td colSpan="3" className="text-center py-10 text-gray-500">No se encontraron materiales para los filtros seleccionados.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}