// --- START OF FILE: src/app/dashboard/list/SurgeryListItem.js (FULL AND ROBUST) ---

'use client'

import { useMemo } from 'react';

// --- NUEVO: Función de ayuda para convertir HEX a RGBA, previene errores de renderizado ---
const hexToRgba = (hex, alpha) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return 'rgba(107, 114, 128, 0.15)'; // Devuelve un gris por defecto si el HEX es inválido
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
};

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

export default function SurgeryListItem({ surgery, onRowClick }) {

  // --- Lógica para calcular los tags y el título (reutilizada de SurgeryCard) ---
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
      className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors last:border-b-0"
    >
      {/* Columna 1: Pedido */}
      <div className="w-2/5 pl-2">
        <p className="font-semibold text-sm text-gray-900 truncate" title={title}>{title}</p>
        <p className="text-xs text-gray-500 truncate" title={subtitle}>{subtitle}</p>
      </div>

      {/* Columna 2: Fecha de Cirugía */}
      <div className="w-1/5 text-sm text-gray-600">{formatDate(surgery.surgery_date)}</div>

      {/* Columna 3: Estado */}
      <div className="w-1/5">
        <span 
          className="px-2 py-1 text-xs font-semibold rounded-full" 
          style={{ 
            backgroundColor: hexToRgba(surgery.status?.color, 0.15),
            color: surgery.status?.color || '#4B5563'
          }}
        >
          {surgery.status?.name || 'N/A'}
        </span>
      </div>

      {/* Columna 4: Etiquetas */}
      <div className="w-1/5 flex flex-wrap items-center">
        {tags.length > 0 
          ? tags.map(tag => <ListTag key={tag.text} text={tag.text} colorClasses={tag.classes} />)
          : <span className="text-xs text-gray-400">-</span>
        }
      </div>
    </div>
  );
}