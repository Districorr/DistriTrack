// --- START OF FILE: src/app/dashboard/components/modal/ModalActions.js (FINAL - USING CANVAS API) ---

'use client';

import { Camera, Clipboard } from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- NUEVA FUNCIÓN DE AYUDA: Dibuja texto con ajuste de línea en el canvas ---
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let testY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, testY);
      line = words[n] + ' ';
      testY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, testY);
  return testY + lineHeight; // Devuelve la posición Y para la siguiente línea
}

export default function ModalActions({ surgery }) { // Ya no necesitamos modalRef

  // --- CORRECCIÓN CLAVE: Lógica de exportación reescrita para usar Canvas ---
  const handleExportImage = () => {
    const toastId = toast.loading('Generando imagen...');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // --- Configuración del Canvas y Diseño ---
      const width = 800;
      const padding = 40;
      const contentWidth = width - padding * 2;
      const lineHeight = 24;
      let currentY = padding;

      // Estilos de fuente
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#1f2937'; // gray-800

      // --- Dibujar Contenido ---
      // Título
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Pedido: ${surgery.patient_name}`, padding, currentY);
      currentY += lineHeight * 2;

      // Información General
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Información General', padding, currentY);
      currentY += lineHeight;
      ctx.font = '16px sans-serif';
      
      const info = [
        { label: 'Médico', value: surgery.doctor_name },
        { label: 'Institución', value: surgery.institution },
        { label: 'Proveedor', value: surgery.provider_data?.name || surgery.provider },
        { label: 'Fecha Cirugía', value: new Date(surgery.surgery_date).toLocaleDateString('es-AR', { timeZone: 'UTC' }) },
        { label: 'N° OC', value: surgery.purchase_order_number },
      ];

      info.forEach(item => {
        if (item.value) {
          ctx.fillText(`${item.label}: ${item.value}`, padding, currentY);
          currentY += lineHeight;
        }
      });
      currentY += lineHeight;

      // Materiales
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Materiales Solicitados', padding, currentY);
      currentY += lineHeight;
      ctx.font = '16px sans-serif';

      surgery.surgery_materials.forEach(m => {
        const materialName = m.materials?.name || m.free_text_description;
        ctx.fillText(`- ${materialName} (Cant: ${m.quantity_requested})`, padding, currentY);
        currentY += lineHeight;
      });
      currentY += lineHeight;

      // Notas
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Últimas Notas', padding, currentY);
      currentY += lineHeight;
      ctx.font = '16px sans-serif';

      const sortedNotes = [...surgery.surgery_notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      sortedNotes.slice(0, 3).forEach(note => { // Mostramos hasta 3 notas
        const noteHeader = `${note.user?.full_name || 'Usuario'} - ${new Date(note.created_at).toLocaleString('es-AR')}`;
        ctx.font = 'italic 14px sans-serif';
        ctx.fillStyle = '#4b5563'; // gray-600
        ctx.fillText(noteHeader, padding, currentY);
        currentY += lineHeight * 0.8;
        
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#1f2937'; // gray-800
        currentY = wrapText(ctx, note.content, padding + 10, currentY, contentWidth - 10, lineHeight);
        currentY += lineHeight * 0.5;
      });

      // Ajustar la altura del canvas al contenido
      canvas.width = width;
      canvas.height = currentY;

      // Volver a dibujar todo con el tamaño correcto (el cambio de tamaño limpia el canvas)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Re-dibujar contenido (código duplicado para simplicidad, se puede refactorizar)
      currentY = padding;
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Pedido: ${surgery.patient_name}`, padding, currentY);
      currentY += lineHeight * 2;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Información General', padding, currentY);
      currentY += lineHeight;
      ctx.font = '16px sans-serif';
      info.forEach(item => {
        if (item.value) {
          ctx.fillText(`${item.label}: ${item.value}`, padding, currentY);
          currentY += lineHeight;
        }
      });
      currentY += lineHeight;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Materiales Solicitados', padding, currentY);
      currentY += lineHeight;
      ctx.font = '16px sans-serif';
      surgery.surgery_materials.forEach(m => {
        const materialName = m.materials?.name || m.free_text_description;
        ctx.fillText(`- ${materialName} (Cant: ${m.quantity_requested})`, padding, currentY);
        currentY += lineHeight;
      });
      currentY += lineHeight;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Últimas Notas', padding, currentY);
      currentY += lineHeight;
      sortedNotes.slice(0, 3).forEach(note => {
        const noteHeader = `${note.user?.full_name || 'Usuario'} - ${new Date(note.created_at).toLocaleString('es-AR')}`;
        ctx.font = 'italic 14px sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText(noteHeader, padding, currentY);
        currentY += lineHeight * 0.8;
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#1f2937';
        currentY = wrapText(ctx, note.content, padding + 10, currentY, contentWidth - 10, lineHeight);
        currentY += lineHeight * 0.5;
      });

      // Descargar la imagen
      const link = document.createElement('a');
      link.download = `pedido_${surgery.patient_name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('¡Imagen generada!', { id: toastId });

    } catch (error) {
      console.error('Error al generar la imagen con Canvas:', error);
      toast.error('No se pudo generar la imagen.', { id: toastId });
    }
  };

  const handleCopyToClipboard = () => {
    const details = `
Detalle del Pedido
-------------------
Paciente: ${surgery.patient_name || 'N/A'}
Médico: ${surgery.doctor_name || 'N/A'}
Institución: ${surgery.institution || 'N/A'}
Fecha de Cirugía: ${new Date(surgery.surgery_date).toLocaleDateString('es-AR', { timeZone: 'UTC' }) || 'N/A'}
Proveedor: ${surgery.provider_data?.name || surgery.provider || 'N/A'}
N° OC: ${surgery.purchase_order_number || 'N/A'}

Materiales:
${surgery.surgery_materials.map(m => `- ${m.materials?.name || m.free_text_description} (Cantidad: ${m.quantity_requested})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      toast.success('¡Detalles copiados al portapapeles!');
    }, (err) => {
      toast.error('No se pudo copiar al portapapeles.');
      console.error('Error al copiar: ', err);
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleCopyToClipboard}
        className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-indigo-600 transition-colors"
        title="Copiar detalles al portapapeles"
      >
        <Clipboard size={18} />
      </button>
      <button
        onClick={handleExportImage}
        className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-indigo-600 transition-colors"
        title="Exportar como imagen"
      >
        <Camera size={18} />
      </button>
    </div>
  );
}