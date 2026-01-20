import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { XRayAnalysis } from '../types/analysis';

async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

export async function generatePDFReport(analysis: XRayAnalysis): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OncoScanAI Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text('AI-Powered Chest X-Ray Analysis', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  const reportInfoY = yPos;
  pdf.setFontSize(11);
  pdf.setTextColor(0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Report Information', margin, yPos);
  yPos += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const reportData = [
    ['Report ID:', analysis.id],
    ['Generated:', new Date(analysis.created_at).toLocaleString()],
    ['Image Name:', analysis.image_name],
    ['Patient Name:', analysis.patient_name || 'Not Specified'],
    ['Patient Age:', analysis.patient_age ? `${analysis.patient_age} years` : 'Not Specified'],
    ['Status:', analysis.status.toUpperCase()],
  ];

  reportData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    const maxWidth = 60;
    const valueText = value.length > 35 ? value.substring(0, 32) + '...' : value;
    pdf.text(valueText, margin + 35, yPos);
    yPos += 6;
  });

  if (analysis.image_url) {
    try {
      const imageData = await loadImageAsBase64(analysis.image_url);
      const imgX = pageWidth - margin - 50;
      const imgY = reportInfoY - 5;
      const imgWidth = 50;
      const imgHeight = 50;

      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.rect(imgX, imgY, imgWidth, imgHeight);

      pdf.addImage(imageData, 'JPEG', imgX + 1, imgY + 1, imgWidth - 2, imgHeight - 2);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scan Image', imgX + imgWidth / 2, imgY + imgHeight + 5, { align: 'center' });
    } catch (error) {
      console.error('Failed to load image for PDF:', error);
      const imgX = pageWidth - margin - 50;
      const imgY = reportInfoY - 5;
      const imgWidth = 50;
      const imgHeight = 50;

      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.rect(imgX, imgY, imgWidth, imgHeight);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text('Scan Image', imgX + imgWidth / 2, imgY + imgHeight / 2, { align: 'center' });
      pdf.setTextColor(0);
    }
  }

  yPos += 5;
  pdf.setDrawColor(200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Analysis Results', margin, yPos);
  yPos += 7;

  if (analysis.prediction_class && analysis.confidence_score) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Primary Finding:', margin, yPos);
    yPos += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(220, 38, 38);
    pdf.text(analysis.prediction_class, margin + 5, yPos);
    yPos += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text(`Confidence Score: ${analysis.confidence_score.toFixed(1)}%`, margin + 5, yPos);
    yPos += 10;

    if (analysis.predictions_json) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('All Predictions:', margin, yPos);
      yPos += 7;

      const sorted = Object.entries(analysis.predictions_json)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      sorted.forEach(([condition, score]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        const barWidth = 70;
        const barHeight = 4;
        const barX = margin + 50;

        pdf.text(condition, margin + 2, yPos);

        pdf.setFillColor(229, 231, 235);
        pdf.rect(barX, yPos - 3, barWidth, barHeight, 'F');

        pdf.setFillColor(59, 130, 246);
        pdf.rect(barX, yPos - 3, (score / 100) * barWidth, barHeight, 'F');

        pdf.text(`${score.toFixed(1)}%`, barX + barWidth + 3, yPos);
        yPos += 6;
      });
    }
  }

  yPos += 5;

  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Clinical Report', margin, yPos);
  yPos += 7;

  if (analysis.clinical_report) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(analysis.clinical_report, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      if (yPos > pageHeight - margin - 10) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    pdf.text('No clinical report available.', margin, yPos);
    yPos += 7;
  }

  if (analysis.notes) {
    yPos += 5;
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Additional Notes', margin, yPos);
    yPos += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const notesLines = pdf.splitTextToSize(analysis.notes, pageWidth - 2 * margin);
    notesLines.forEach((line: string) => {
      if (yPos > pageHeight - margin - 10) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
  }

  const footerY = pageHeight - margin - 5;
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(80);
  pdf.text('Note: This is an AI-generated report and should be verified by a qualified radiologist.', margin, footerY);

  const filename = `OncoScanAI_Report_${analysis.image_name.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

export async function captureElementAsPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
