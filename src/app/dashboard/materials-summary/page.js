// --- START OF FILE: src/app/dashboard/materials-summary/page.js (FULL AND VERIFIED) ---

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MaterialsSummaryClient from './MaterialsSummaryClient'

export default async function MaterialsSummaryPage() {
  const supabase = createClient();

  // 1. Proteger la ruta: verificar si hay un usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 2. Proteger la ruta: verificar si el usuario es administrador
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return redirect('/dashboard');
  }

  // 3. Obtener los datos estáticos para los filtros (la lista de todos los estados)
  const { data: statuses, error: statusesError } = await supabase
    .from('pipeline_statuses')
    .select('id, name, color')
    .order('sort_order');

  if (statusesError) {
    console.error("Error fetching statuses for summary page:", statusesError);
    // En un caso real, se podría mostrar una página de error aquí.
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resumen de Materiales</h1>
            <p className="mt-1 text-gray-600">Agrupación y suma de todos los materiales solicitados en los pedidos.</p>
          </div>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            ← Volver al Pipeline
          </Link>
        </div>
        
        {/* 4. Renderizar el componente cliente, pasándole los datos necesarios */}
        <MaterialsSummaryClient 
          initialSummary={[]} // Se pasa un array vacío, el cliente hará la carga inicial
          statuses={statuses || []} 
        />
      </div>
    </div>
  );
}