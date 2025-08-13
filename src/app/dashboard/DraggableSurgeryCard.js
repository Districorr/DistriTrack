'use client'

import { useDraggable } from '@dnd-kit/core'
import { SurgeryCard } from './SurgeryCard'

// --- NUEVO: Handle con Círculo y Mejor Ícono de Chincheta ---
const DragHandle = (props) => (
  <div 
    {...props} 
    // Posicionamiento en la esquina inferior derecha
    className="absolute bottom-2 right-2 flex items-center justify-center 
               w-7 h-7 rounded-full 
               bg-green-500 bg-opacity-75 
               cursor-grab active:cursor-grabbing touch-none 
               transition-all hover:bg-opacity-100 hover:scale-110"
    onClick={(e) => e.stopPropagation()} 
    title="Arrastrar para mover" // Tooltip para accesibilidad
  >
    {/* SVG para un ícono de Chincheta 📌 más claro */}
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  </div>
);

export function DraggableSurgeryCard({ surgery, isAdmin, onCardClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: surgery.id,
    data: { surgery },
    disabled: !isAdmin,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  // La tarjeta se desvanece un poco para dar feedback de que se está moviendo
  const cardClasses = isDragging ? 'opacity-40' : 'opacity-100';

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* El handle de arrastre solo se muestra para el admin */}
      {isAdmin && <DragHandle {...listeners} {...attributes} />}
      
      <div className={cardClasses}>
        <SurgeryCard 
          surgery={surgery} 
          onCardClick={onCardClick} 
        />
      </div>
    </div>
  );
}