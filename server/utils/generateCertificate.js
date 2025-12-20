const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = (studentName, courseTitle, completionDate) => {
  return new Promise((resolve, reject) => {
    try {
      // Create certificates directory if it doesn't exist
      const certDir = path.join(__dirname, '../certificates');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      // Generate unique filename
      const fileName = `certificate_${Date.now()}.pdf`;
      const filePath = path.join(certDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape'
      });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const borderWidth = 8;

      // Add background gradient effect
      doc.save();
      doc.rect(0, 0, pageWidth, pageHeight).fill('#f8fafc');
      doc.restore();

      // Add decorative border
      doc.save();
      doc.lineWidth(borderWidth);
      doc.strokeColor('#1e40af');
      doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 20).stroke();
      doc.restore();

      // Add inner decorative border
      doc.save();
      doc.lineWidth(2);
      doc.strokeColor('#3b82f6');
      doc.roundedRect(margin + borderWidth/2, margin + borderWidth/2, pageWidth - 2 * (margin + borderWidth/2), pageHeight - 2 * (margin + borderWidth/2), 15).stroke();
      doc.restore();

      // Add corner flourishes
      const flourishSize = 30;
      doc.save();
      doc.strokeColor('#1e40af');
      doc.lineWidth(3);

      // Top-left flourish
      doc.moveTo(margin + 20, margin + 20).lineTo(margin + 20 + flourishSize, margin + 20);
      doc.moveTo(margin + 20, margin + 20).lineTo(margin + 20, margin + 20 + flourishSize);

      // Top-right flourish
      doc.moveTo(pageWidth - margin - 20, margin + 20).lineTo(pageWidth - margin - 20 - flourishSize, margin + 20);
      doc.moveTo(pageWidth - margin - 20, margin + 20).lineTo(pageWidth - margin - 20, margin + 20 + flourishSize);

      // Bottom-left flourish
      doc.moveTo(margin + 20, pageHeight - margin - 20).lineTo(margin + 20 + flourishSize, pageHeight - margin - 20);
      doc.moveTo(margin + 20, pageHeight - margin - 20).lineTo(margin + 20, pageHeight - margin - 20 - flourishSize);

      // Bottom-right flourish
      doc.moveTo(pageWidth - margin - 20, pageHeight - margin - 20).lineTo(pageWidth - margin - 20 - flourishSize, pageHeight - margin - 20);
      doc.moveTo(pageWidth - margin - 20, pageHeight - margin - 20).lineTo(pageWidth - margin - 20, pageHeight - margin - 20 - flourishSize);

      doc.stroke();
      doc.restore();

      // Certificate content with improved styling
      const contentY = pageHeight / 2 - 80;

      // Title with shadow effect
      doc.save();
      doc.fontSize(36).fillColor('#1e40af');
      doc.text('Certificate of Completion', margin + 60, contentY - 60, { align: 'center', width: pageWidth - 2 * (margin + 60) });
      doc.restore();

      doc.moveDown(1.5);

      // Introductory text
      doc.fontSize(22).fillColor('#374151');
      doc.text('This is to certify that', margin + 60, contentY - 20, { align: 'center', width: pageWidth - 2 * (margin + 60) });
      doc.moveDown(0.5);

      // Student name with special styling
      doc.save();
      doc.fontSize(32).fillColor('#2563eb');
      doc.text(studentName, margin + 60, contentY + 20, { align: 'center', width: pageWidth - 2 * (margin + 60) });
      doc.restore();

      // Completion text
      doc.fontSize(20).fillColor('#374151');
      doc.text('has successfully completed the course', margin + 60, contentY + 60, { align: 'center', width: pageWidth - 2 * (margin + 60) });
      doc.moveDown(0.5);

      // Course title with green highlight
      doc.save();
      doc.fontSize(28).fillColor('#059669');
      doc.text(courseTitle, margin + 60, contentY + 100, { align: 'center', width: pageWidth - 2 * (margin + 60) });
      doc.restore();

      // Completion date
      doc.fontSize(18).fillColor('#6b7280');
      doc.text(`Completion Date: ${completionDate}`, margin + 60, contentY + 140, { align: 'center', width: pageWidth - 2 * (margin + 60) });

      // Issuer signature area
      doc.moveDown(1);
      doc.fontSize(16).fillColor('#374151');
      doc.text('Unstop LMS', margin + 60, contentY + 180, { align: 'center', width: pageWidth - 2 * (margin + 60) });

      // Add signature line
      doc.save();
      doc.strokeColor('#6b7280');
      doc.lineWidth(1);
      doc.moveTo(pageWidth/2 - 100, contentY + 200).lineTo(pageWidth/2 + 100, contentY + 200).stroke();
      doc.restore();

      doc.fontSize(12).fillColor('#9ca3af');
      doc.text('Authorized Signature', margin + 60, contentY + 210, { align: 'center', width: pageWidth - 2 * (margin + 60) });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };
