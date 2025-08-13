// --- START OF FILE: src/lib/exportUtils.js (COMPLETELY REWRITTEN) ---

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Función de Ayuda para Formatear Fechas ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Aseguramos que la fecha se interprete correctamente como UTC
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { timeZone: 'UTC' });
  } catch (e) {
    return 'Fecha inválida';
  }
};

// --- NUEVA FUNCIÓN MEJORADA PARA EXCEL ---
export const exportToExcel = async (surgeries) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pedidos DistriTrack');
  const date = new Date().toISOString().split('T')[0];

  // Definir las columnas
  worksheet.columns = [
    { header: 'Paciente', key: 'patient', width: 30 },
    { header: 'Fecha Cirugía', key: 'surgery_date', width: 15 },
    { header: 'Estado', key: 'status', width: 25 },
    { header: 'N° OC', key: 'po_number', width: 15 },
    { header: 'Médico', key: 'doctor', width: 30 },
    { header: 'Institución', key: 'institution', width: 40 },
    { header: 'Proveedor', key: 'provider', width: 30 },
    { header: 'Etiquetas', key: 'tags', width: 25 },
    { header: 'Materiales', key: 'materials', width: 50 },
    { header: 'Última Nota', key: 'last_note', width: 50 },
    { header: 'Creado por', key: 'creator', width: 30 },
    { header: 'Fecha Creación', key: 'created_at', width: 20 },
  ];

  // Estilos para la cabecera
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // Azul oscuro
  };

  // Añadir los datos de cada cirugía
  surgeries.forEach(surgery => {
    const tags = [];
    if (surgery.is_urgent) tags.push('URGENTE');
    if (surgery.is_rework) tags.push('REPROCESO');

    const materialsText = surgery.surgery_materials
      .map(m => `${m.materials?.name || m.free_text_description} (x${m.quantity_requested})`)
      .join('\n');
      
    const lastNote = surgery.surgery_notes?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    worksheet.addRow({
      patient: surgery.patient_name,
      surgery_date: formatDate(surgery.surgery_date),
      status: surgery.status?.name || 'N/A',
      po_number: surgery.purchase_order_number || '-',
      doctor: surgery.doctor_name || 'N/A',
      institution: surgery.institution || 'N/A',
      provider: surgery.provider_data?.name || surgery.provider || 'N/A',
      tags: tags.join(', ') || '-',
      materials: materialsText,
      last_note: lastNote ? `${lastNote.user.full_name}: ${lastNote.content}` : '-',
      creator: surgery.creator?.full_name || 'N/A',
      created_at: new Date(surgery.created_at).toLocaleString('es-AR'),
    });
  });

  // Ajustar el alto de las filas para contenido multilínea
  worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    if (rowNumber > 1) {
      row.getCell('materials').alignment = { wrapText: true, vertical: 'top' };
      row.getCell('last_note').alignment = { wrapText: true, vertical: 'top' };
    }
  });

  // Generar y descargar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_DistriTrack_${date}.xlsx`);
};


// --- NUEVA FUNCIÓN MEJORADA PARA PDF ---
export const exportToPdf = (surgeries, title) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const date = new Date().toLocaleDateString('es-AR');

  doc.setFontSize(18);
  doc.text(`Reporte de Pedidos - ${title}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${date}`, 14, 29);

  const head = [['Paciente', 'Fecha Cirugía', 'Estado', 'Proveedor', 'N° OC']];
  const body = surgeries.map(s => [
    s.patient_name,
    formatDate(s.surgery_date),
    s.status?.name || 'N/A',
    s.provider_data?.name || s.provider || 'N/A',
    s.purchase_order_number || '-'
  ]);

  autoTable(doc, {
    head: head,
    body: body,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] }, // Azul oscuro
    styles: { fontSize: 8 },
  });

  doc.save(`Reporte_DistriTrack_${title.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
};