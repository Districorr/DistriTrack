// --- START OF FILE: src/app/dashboard/missing-items/page.js (FIXED PRERENDER ERROR) ---

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MissingItemsClient from './MissingItemsClient'

export default async function MissingItemsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return redirect('/dashboard');
  }

  const { data: missingItems, error } = await supabase
    .from('surgery_materials')
    .select(`
      id,
      quantity_requested,
      materials (name, code),
      surgeries (patient_name, surgery_date)
    `)
    .eq('is_missing', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching missing items:", error);
    // Si hay un error, no podemos continuar, pero nos aseguramos de no pasar 'undefined'
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materiales Faltantes</h1>
            <p className="mt-1 text-gray-600">Lista de todos los materiales marcados como faltantes en los pedidos.</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            ← Volver al Pipeline
          </Link>
        </div>
        {/* --- CORREGIDO: Nos aseguramos de pasar siempre un array, incluso si la consulta falla --- */}
        <MissingItemsClient initialItems={missingItems || []} />
      </div>
    </div>
  );
}