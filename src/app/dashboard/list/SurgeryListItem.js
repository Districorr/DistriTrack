// --- START OF FILE: src/app/dashboard/list/SurgeryListItem.js (FULL, RESPONSIVE, AND ENHANCED) ---

'use client'

import { useMemo } from 'react';

// --- Componente de Ayuda: Tag visual para la lista ---
const ListTag = ({ text, colorClasses }) => (
  <span className={`inline-block mr-1.5 mb-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${colorClasses}`}>
    {text}
  </span>
);

// --- Componente de Ayuda: Formateador de Fecha ---
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Componente de Ayuda para la vista móvil ---
const MobileDataRow = ({ label, children }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="font-medium text-gray-500">{label}</span>
    <span className="text-gray-800">{children}</span>
  </div>
);

export default function SurgeryListItem({ surgery, onRowClick }) {

  // --- Lógica para calcular los tags y el título (sin cambios) ---
  const { tags, title, subtitle } = useMemo(() => {
    const calculatedTags = [];
    if (surgery.is_urgent) calculatedTags.push({ text: 'URGENTE', classes: 'bg-red-100 text-red-700' });
    if (surgery.is_rework) calculatedTags.push({ text: 'REPROCESO', classes: 'bg-purple-100 text-purple-700' });
    if (surgery.surgery_materials.some(m => m.is_missing)) calculatedTags.push({ text: 'FALTANTES', classes: 'bg-yellow-100 text-yellow-800' });
    if (surgery.surgery_materials.some(m => !m.materials && m.free_text_description)) calculatedTags.push({ text: 'PROVISORIO', classes: 'bg-blue-100 text-blue-700' });

    let mainTitle = 'Pedido sin Título';
    let subTitle = `Paciente: ${surgery.patient_name || 'No especificado'}`;
    const firstFormal = surgery.surgery_materials.find(m => m.materials);
    const firstProvisional = surgery.surgery_materials.find(m => m.free_text_description);

    if (firstFormal) {
      mainTitle = firstFormal.materials.name;
    } else if (firstProvisional) {
      mainTitle = firstProvisional.free_text_description;
    } else if (surgery.patient_name) {
      mainTitle = surgery.patient_name;
      subTitle = 'Pedido sin materiales asignados';
    }
    
    return { tags: calculatedTags, title: mainTitle, subtitle: subTitle };
  }, [surgery]);

  return (
    <div 
      onClick={onRowClick}
      className="bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors last:border-b-0"
    >
      {/* --- VISTA DE ESCRITORIO (md:flex) --- */}
      <div className="hidden md:flex items-center p-3">
        <div className="w-2/5 pl-2">
          <p className="font-semibold text-sm text-gray-900 truncate" title={title}>{title}</p>
          <p className="text-xs text-gray-500 truncate" title={subtitle}>{subtitle}</p>
        </div>
        <div className="w-1/5 text-sm text-gray-600">{formatDate(surgery.surgery_date)}</div>
        <div className="w-1/5">
          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: surgery.status?.color ? `${surgery.status.color}20` : '#E5E7EB', color: surgery.status?.color || '#4B5563' }}>
            {surgery.status?.name || 'N/A'}
          </span>
        </div>
        <div className="w-1/5 flex flex-wrap items-center">
          {tags.length > 0 ? tags.map(tag => <ListTag key={tag.text} text={tag.text} colorClasses={tag.classes} />) : <span className="text-xs text-gray-400">-</span>}
        </div>
      </div>

      {/* --- VISTA MÓVIL (block md:hidden) --- */}
      <div className="block md:hidden p-4 space-y-3">
        {/* Sección de Título y Tags */}
        <div>
          <div className="flex flex-wrap items-center mb-1">
            {tags.map(tag => <ListTag key={tag.text} text={tag.text} colorClasses={tag.classes} />)}
          </div>
          <p className="font-bold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        
        {/* Sección de Detalles */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <MobileDataRow label="Fecha CX:">
            {formatDate(surgery.surgery_date)}
          </MobileDataRow>
          <MobileDataRow label="Estado:">
            <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: surgery.status?.color ? `${surgery.status.color}20` : '#E5E7EB', color: surgery.status?.color || '#4B5563' }}>
              {surgery.status?.name || 'N/A'}
            </span>
          </MobileDataRow>
        </div>
      </div>
    </div>
  );
}
