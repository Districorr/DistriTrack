// --- START OF FILE: src/lib/exportUtils.js (FULL AND VERIFIED) ---

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// --- Función de Ayuda para Formatear Fechas ---
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Funciones para la página de RESUMEN DE MATERIALES ---

export const exportSummaryToPdf = (summaryData, filteredStatuses) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('es-AR');
  
  doc.setFontSize(18);
  doc.text("Resumen de Materiales Solicitados", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${date}`, 14, 29);
  if (filteredStatuses.length > 0) {
    doc.text(`Filtrado por estados: ${filteredStatuses.map(s => s.name).join(', ')}`, 14, 36);
  }

  autoTable(doc, {
    head: [['Material', 'Código', 'Cantidad Total']],
    body: summaryData.map(item => [item.material_name, item.material_code, item.total_quantity]),
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [22, 78, 99] },
  });

  doc.save(`Resumen_Materiales_${date.replace(/\//g, '-')}.pdf`);
};

export const exportDetailsToExcel = async (surgeries, filteredStatuses) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Desglose de Pedidos');
  const date = new Date().toISOString().split('T')[0];

  worksheet.columns = [
    { header: 'Material', key: 'material', width: 40 },
    { header: 'Código', key: 'code', width: 20 },
    { header: 'Cantidad', key: 'quantity', width: 10 },
    { header: 'Estado del Pedido', key: 'status', width: 25 },
    { header: 'Paciente', key: 'patient', width: 30 },
    { header: 'Fecha Cirugía', key: 'date', width: 15 },
  ];

  surgeries.forEach(surgery => {
    if (surgery.surgery_materials.length > 0) {
      surgery.surgery_materials.forEach(item => {
        if (item.materials) {
          const row = worksheet.addRow({
            material: item.materials.name,
            code: item.materials.code,
            quantity: item.quantity_requested,
            status: surgery.status.name,
            patient: surgery.patient_name,
            date: new Date(surgery.surgery_date + 'T00:00:00').toLocaleDateString('es-AR'),
          });

          const statusCell = row.getCell('status');
          if (surgery.status.color) {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + surgery.status.color.replace('#', '') },
            };
            statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
        }
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Desglose_Pedidos_${date}.xlsx`);
};


// --- Funciones para la VISTA DE LISTA ---

export const exportListToPdf = (listData) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const date = new Date().toLocaleDateString('es-AR');
  
  doc.setFontSize(18);
  doc.text("Reporte de Pedidos (Lista) - DistriTrack", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${date}`, 14, 29);

  autoTable(doc, {
    head: [['Pedido', 'Paciente', 'Fecha Cirugía', 'Estado', 'Etiquetas']],
    body: listData.map(item => [
      item.title,
      item.patient,
      item.surgery_date,
      item.status,
      item.tags
    ]),
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] },
  });

  doc.save(`Reporte_Pedidos_Lista_${date.replace(/\//g, '-')}.pdf`);
};

export const exportListToExcel = async (listData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pedidos');
  const date = new Date().toISOString().split('T')[0];

  worksheet.columns = [
    { header: 'Pedido', key: 'title', width: 40 },
    { header: 'Paciente', key: 'patient', width: 30 },
    { header: 'Fecha Cirugía', key: 'surgery_date', width: 15 },
    { header: 'Estado', key: 'status', width: 25 },
    { header: 'Etiquetas', key: 'tags', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' },
  };

  worksheet.addRows(listData);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_Pedidos_Lista_${date}.xlsx`);
};


// --- Funciones para la VISTA DE PIPELINE ---

export const exportPipelineToPdf = async (pipelineElement) => {
  if (!pipelineElement) return;

  const canvas = await html2canvas(pipelineElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f3f4f6'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  const date = new Date().toISOString().split('T')[0];
  pdf.save(`Pipeline_DistriTrack_${date}.pdf`);
};

export const exportPipelineToExcel = async (surgeries) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pipeline');
  const date = new Date().toISOString().split('T')[0];

  worksheet.columns = [
    { header: 'Estado', key: 'status', width: 25 },
    { header: 'Pedido', key: 'title', width: 40 },
    { header: 'Paciente', key: 'patient', width: 30 },
    { header: 'Fecha Cirugía', key: 'date', width: 15 },
    { header: 'Etiquetas', key: 'tags', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };

  surgeries.forEach(surgery => {
    const tags = [];
    if (surgery.is_urgent) tags.push('URGENTE');
    if (surgery.is_rework) tags.push('REPROCESO');
    if (surgery.surgery_materials.some(m => m.is_missing)) tags.push('FALTANTES');
    if (surgery.surgery_materials.some(m => !m.materials && m.free_text_description)) tags.push('PROVISORIO');
    
    const firstFormal = surgery.surgery_materials.find(m => m.materials);
    const firstProvisional = surgery.surgery_materials.find(m => m.free_text_description);
    let title = firstFormal?.materials.name || firstProvisional?.free_text_description || surgery.patient_name;

    const row = worksheet.addRow({
      status: surgery.status?.name || 'N/A',
      title: title,
      patient: surgery.patient_name,
      date: formatDate(surgery.surgery_date),
      tags: tags.join(', ') || '-',
    });

    const statusCell = row.getCell('status');
    if (surgery.status?.color) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + surgery.status.color.replace('#', '') } };
      statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Pipeline_Datos_${date}.xlsx`);
};