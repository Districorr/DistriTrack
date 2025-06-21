'use client'

const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const InfoRow = ({ label, value }) => (
  <div className="text-xs text-gray-600">
    <span className="font-semibold text-gray-800">{label}:</span> {value || 'N/A'}
  </div>
);

export const SurgeryCard = ({ surgery, onCardClick }) => {
  // --- LÓGICA MEJORADA PARA MOSTRAR EL MATERIAL PRINCIPAL ---
  const mainItem = surgery.surgery_materials?.[0];
  let title = 'Pedido sin materiales';
  let subtitle = '-';

  if (mainItem) {
    // Si es un material formal (tiene la relación 'materials')
    if (mainItem.materials) {
      title = mainItem.materials.name;
      subtitle = `${mainItem.materials.code} - ${mainItem.materials.brand}`;
    } 
    // Si es un material provisorio (tiene 'free_text_description')
    else if (mainItem.free_text_description) {
      title = mainItem.free_text_description;
      subtitle = '(Provisorio - Pendiente de asignación)';
    }
  }

  const totalMaterials = surgery.surgery_materials?.length || 0;

  return (
    <div 
      onClick={() => onCardClick(surgery)}
      className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
    >
      <div>
        <h3 className="font-bold text-base text-gray-900 leading-tight">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
        {totalMaterials > 1 && (<p className="text-xs font-semibold text-indigo-600 mt-1">+ {totalMaterials - 1} otro(s) material(es)</p>)}
      </div>
      <hr className="my-2 border-gray-200" />
      <div className="space-y-1">
        <InfoRow label="Paciente" value={surgery.patient_name} />
        <InfoRow label="Médico" value={surgery.doctor_name} />
        <InfoRow label="Lugar" value={surgery.institution} />
        <InfoRow label="Fecha CX" value={formatDate(surgery.surgery_date)} />
        <div className="flex justify-between items-end pt-1">
          <InfoRow label="Creado por" value={surgery.creator?.full_name} />
          <div className="w-6 h-6"></div>
        </div>
      </div>
    </div>
  );
};