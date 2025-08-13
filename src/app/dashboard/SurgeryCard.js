// --- START OF FILE: src/app/dashboard/SurgeryCard.js (FINAL FIX WITH NULL CHECKS) ---

'use client'

import { useMemo } from 'react';

// --- Componentes de Ayuda y Iconos (sin cambios) ---
const hexToRgba = (hex, alpha) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return 'rgba(107, 114, 128, 0.15)';
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return `rgba(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255}, ${alpha})`;
};

const CardTag = ({ text, hexColor }) => (
  <span 
    className="inline-block mr-1.5 mb-1.5 px-2 py-0.5 text-xs font-semibold rounded-full"
    style={{
      backgroundColor: hexToRgba(hexColor, 0.15),
      color: hexColor
    }}
  >
    {text}
  </span>
);

const IconInfo = ({ icon, text }) => ( <div className="flex items-center space-x-1.5 text-xs text-gray-600">{icon}<span className="truncate">{text || 'N/A'}</span></div>);
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const DoctorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const PatientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.978 9.978 0 0010 12c-2.31 0-4.438.784-6.131-2.095z" /></svg>;
const MaterialsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>;

export const SurgeryCard = ({ surgery, onCardClick }) => {
  
  const { tags, title, subtitle } = useMemo(() => {
    const calculatedTags = [];
    if (surgery.is_urgent) calculatedTags.push({ text: 'URGENTE', color: '#EF4444' });
    if (surgery.is_rework) calculatedTags.push({ text: 'REPROCESO', color: '#8B5CF6' });
    if (surgery.surgery_materials?.some(m => m.is_missing)) calculatedTags.push({ text: 'FALTANTES', color: '#F59E0B' });
    
    // --- CORRECCIÓN CLAVE: Se añade una comprobación de nulidad ---
    if (surgery.provider_data && surgery.provider_data.name) {
      calculatedTags.push({ text: surgery.provider_data.name.toUpperCase(), color: surgery.provider_data.color || '#6B7280' });
    } else if (surgery.provider) {
      calculatedTags.push({ text: surgery.provider.toUpperCase(), color: '#6B7280' });
    }

    let mainTitle = 'Pedido sin Título';
    let subTitle = `Paciente: ${surgery.patient_name || 'No especificado'}`;
    const firstFormal = surgery.surgery_materials?.find(m => m.materials);
    const firstProvisional = surgery.surgery_materials?.find(m => m.free_text_description);

    if (firstFormal) { mainTitle = firstFormal.materials.name; } 
    else if (firstProvisional) { mainTitle = firstProvisional.free_text_description; } 
    else if (surgery.patient_name) { mainTitle = surgery.patient_name; subTitle = 'Pedido sin materiales asignados'; }
    
    if (surgery.purchase_order_number) {
      subTitle = `OC: ${surgery.purchase_order_number}`;
    } else if (surgery.surgery_materials?.some(m => !m.materials && m.free_text_description)) {
      subTitle = '(Provisorio - Pendiente de asignación)';
    }

    return { tags: calculatedTags, title: mainTitle, subtitle: subTitle };
  }, [surgery]);

  const formatDate = (dateString) => { if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A'; const [year, month, day] = dateString.split('-'); return `${day}/${month}/${year}`; };
  const totalMaterials = surgery.surgery_materials?.length || 0;

  return (
    <div onClick={() => onCardClick(surgery)} className="p-2.5 bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => <CardTag key={tag.text} text={tag.text} hexColor={tag.color} />)}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 leading-tight truncate" title={title}>{title}</h3>
        <p className="text-xs text-gray-500 truncate" title={subtitle}>{subtitle}</p>
      </div>
      <div className="space-y-1.5 pt-1">
        <IconInfo icon={<PatientIcon />} text={surgery.patient_name} />
        <IconInfo icon={<DoctorIcon />} text={surgery.doctor_name} />
        <IconInfo icon={<LocationIcon />} text={surgery.institution} />
        <IconInfo icon={<CalendarIcon />} text={formatDate(surgery.surgery_date)} />
      </div>
      <div className="pt-2 flex justify-between items-center border-t border-gray-200/80">
        <div className="flex items-center space-x-1 text-xs text-indigo-700 font-medium"><MaterialsIcon /><span>{totalMaterials} Materiales</span></div>
        <span className="text-xs text-gray-500 truncate" title={`Creado por: ${surgery.creator?.full_name}`}>{surgery.creator?.full_name || 'N/A'}</span>
      </div>
    </div>
  );
};