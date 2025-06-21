'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import LogoutButton from '../LogoutButton'

// Función de formato de fecha (YYYY-MM-DD -> DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}/.test(dateString)) return 'N/A';
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

export default function MissingItemsPage() {
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    async function getMissingItems() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Consulta para obtener los materiales marcados como faltantes.
      // Hacemos un JOIN implícito con 'surgeries' y 'materials' para obtener toda la info.
      const { data, error } = await supabase
        .from('surgery_materials')
        .select(`
          id,
          quantity_requested,
          surgeries (
            id,
            patient_name,
            updated_at,
            creator:profiles (full_name)
          ),
          materials (
            name,
            code,
            brand
          )
        `)
        .eq('is_missing', true) // El filtro clave: solo donde is_missing es true.
        .order('updated_at', { referencedTable: 'surgeries', ascending: false }); // Ordena por la fecha de actualización del pedido.

      if (error) {
        console.error("Error fetching missing items:", error);
      } else {
        setMissingItems(data || []);
      }
      setLoading(false);
    }
    getMissingItems();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-white shadow-md gap-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-gray-900">DistriTrack</div>
          <Link href="/dashboard" className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 whitespace-nowrap">Volver al Pipeline</Link>
          <Link href="/dashboard/list" className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 whitespace-nowrap">Vista de Lista</Link>
        </div>
        <h2 className="text-xl font-semibold text-red-600">Materiales Faltantes</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-800 hidden md:inline">{user?.email || 'Cargando...'}</span>
          <LogoutButton />
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p className="text-center text-gray-500">Buscando materiales faltantes...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Faltante</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido Asociado (Paciente)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actualización del Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable del Pedido</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {missingItems.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-500">¡Excelente! No hay materiales marcados como faltantes.</td></tr>
                  ) : (
                    missingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.materials.name}</div>
                          <div className="text-sm text-gray-500">{item.materials.code} - {item.materials.brand}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-600">{item.quantity_requested}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.surgeries.patient_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.surgeries.updated_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.surgeries.creator.full_name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}