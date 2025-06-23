// --- START OF FILE: src/app/dashboard/settings/pipeline/page.js (MODIFIED) ---

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PipelineSettingsClient from './PipelineSettingsClient'

export default async function PipelineSettingsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    // Redirigimos al dashboard si no es admin, la página de error es manejada por el layout
    return redirect('/dashboard');
  }

  const { data: statuses } = await supabase
    .from('pipeline_statuses')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    // --- MODIFICADO: Un contenedor simple para centrar el contenido ---
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <PipelineSettingsClient initialStatuses={statuses || []} />
      </div>
    </div>
  );
}