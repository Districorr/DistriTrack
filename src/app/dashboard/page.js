'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import Pipeline from './Pipeline'
import HeaderMenu from './HeaderMenu'

export default function DashboardPage() {
  const [statuses, setStatuses] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const supabase = createClient();
    async function getInitialData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const role = profile?.role;
      setUserRole(role);

      const { data: statusesData } = await supabase.from('pipeline_statuses').select('*').order('sort_order', { ascending: true });
      setStatuses(statusesData || []);

      // La consulta ahora trae todos los campos necesarios para manejar materiales provisorios
      let query = supabase.from('surgeries').select(`
        *, 
        creator:profiles(full_name), 
        surgery_materials(
          id, 
          is_missing, 
          quantity_requested, 
          observations, 
          free_text_description, 
          materials(name, code, brand)
        ), 
        surgery_history(*, user:profiles(full_name))
      `);
      
      if (role !== 'admin') {
        query = query.eq('creator_id', user.id);
      }
      
      const { data: surgeriesData, error } = await query;
      if (error) {
        console.error("Error fetching surgeries data:", error);
      }
      setSurgeries(surgeriesData || []);
      setLoading(false);
    }
    getInitialData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-white shadow-md gap-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-gray-900">DistriTrack</div>
          <HeaderMenu userRole={userRole} />
        </div>
        
        <div className="flex-grow max-w-lg hidden md:block">
          <input 
            type="text" 
            placeholder="Buscar en pipeline..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/new-surgery" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
            + Agregar Pedido
          </Link>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-gray-800">{user?.email || 'Cargando...'}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-y-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <Pipeline 
            statuses={statuses} 
            initialSurgeries={surgeries} 
            userRole={userRole}
            searchTerm={searchTerm} 
          />
        )}
      </main>
    </div>
  )
}