// src/app/dashboard/components/modal/StatusToggles.js

const ToggleField = ({ label, name, checked, onChange, colorClass, disabled }) => (
    <div className="flex items-center space-x-2">
        <button
            type="button"
            name={name}
            onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
            disabled={disabled}
            className={`${
                checked ? colorClass : 'bg-gray-200'
            } relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <span
                className={`${
                    checked ? 'translate-x-4' : 'translate-x-0'
                } inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
        {/* --- CORRECCIÓN CLAVE: Texto más pequeño --- */}
        <span className={`text-xs font-medium ${disabled && !checked ? 'text-gray-500' : 'text-gray-800'}`}>
            {label}
        </span>
    </div>
);

export default function StatusToggles({ surgery, isEditing, handleInputChange, userRole }) {
    if (!surgery) return null;

    const canEditTags = isEditing && userRole === 'admin';

    return (
        // --- CORRECCIÓN CLAVE: Padding reducido para un look más compacto ---
        <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-4">
                <ToggleField 
                    label="Urgente" 
                    name="is_urgent" 
                    checked={surgery.is_urgent} 
                    onChange={handleInputChange} 
                    colorClass="bg-red-600"
                    disabled={!canEditTags}
                />
                <ToggleField 
                    label="Reproceso" 
                    name="is_rework" 
                    checked={surgery.is_rework} 
                    onChange={handleInputChange} 
                    colorClass="bg-purple-600"
                    disabled={!canEditTags}
                />
            </div>
        </div>
    );
}