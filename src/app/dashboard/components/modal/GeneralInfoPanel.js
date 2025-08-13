// --- START OF FILE: src/app/dashboard/components/modal/GeneralInfoPanel.js (FULL AND CORRECTED) ---

// --- Componente de Ayuda: Función para determinar el color de la fecha (Completo) ---
const getDateColor = (dateString) => {
    if (!dateString) return 'text-gray-800';
    
    const surgeryDate = new Date(dateString);
    const today = new Date();
    
    surgeryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = surgeryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'text-red-600 font-bold';
    }
    if (diffDays <= 7) {
        return 'text-orange-500 font-semibold';
    }
    return 'text-green-600';
};

// --- Componente de Ayuda: Campo de Información (Completo y Corregido) ---
const InfoField = ({ label, value, name, type = 'text', isEditing, onChange, valueClassName = '', highlight = false }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
    {isEditing && type !== 'display' ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full p-1.5 border border-gray-300 rounded-md mt-1 text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
      />
    ) : (
      <p className={`text-sm mt-1 ${valueClassName || 'text-gray-800'} ${highlight ? 'bg-blue-100 text-blue-800 font-bold p-2 rounded-md' : ''}`}>
        {value || 'N/A'}
      </p>
    )}
  </div>
);

// --- Componente Principal: GeneralInfoPanel (Completo y Corregido) ---
export default function GeneralInfoPanel({ surgery, isEditing, handleInputChange }) {
  if (!surgery) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
        </div>
    );
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
      <h3 className="font-bold text-gray-800">Información General</h3>
      
      {/* --- CORRECCIÓN CLAVE: Se añade el campo N° de OC, solo si existe --- */}
      {surgery.purchase_order_number && (
        <InfoField 
          label="N° Orden de Compra" 
          value={surgery.purchase_order_number} 
          name="purchase_order_number" 
          isEditing={false} // Este campo no se edita aquí
          highlight={true} // Prop para destacar el campo
        />
      )}
      
      <InfoField label="Médico" value={surgery.doctor_name} name="doctor_name" isEditing={isEditing} onChange={handleInputChange} />
      <InfoField label="Institución" value={surgery.institution} name="institution" isEditing={isEditing} onChange={handleInputChange} />
      <InfoField label="Cliente" value={surgery.client} name="client" isEditing={isEditing} onChange={handleInputChange} />
      
      {/* --- CORRECCIÓN: Muestra el nombre del proveedor desde el objeto relacionado --- */}
      <InfoField 
        label="Proveedor" 
        value={surgery.provider?.name || surgery.provider} // Muestra el nombre si es un objeto, o el texto libre si no
        name="provider" 
        isEditing={isEditing} 
        onChange={handleInputChange} 
      />
      
      <InfoField 
        label="Fecha de Cirugía" 
        value={isEditing ? formatDateForInput(surgery.surgery_date) : new Date(surgery.surgery_date).toLocaleDateString('es-AR', { timeZone: 'UTC' })} 
        name="surgery_date" 
        type={isEditing ? 'date' : 'display'}
        isEditing={isEditing} 
        onChange={handleInputChange}
        valueClassName={isEditing ? '' : getDateColor(surgery.surgery_date)}
      />
      
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase">Creado por</label>
        <p className="text-sm text-gray-800 mt-1">{surgery.creator?.full_name || 'N/A'}</p>
      </div>
    </div>
  );
}