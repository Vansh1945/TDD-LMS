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

      // Certificate content
      doc.fontSize(30).text('Certificate of Completion', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(20).text('This is to certify that', { align: 'center' });
      doc.moveDown();

      doc.fontSize(25).fillColor('blue').text(studentName, { align: 'center' });
      doc.fillColor('black').moveDown();

      doc.fontSize(18).text('has successfully completed the course', { align: 'center' });
      doc.moveDown();

      doc.fontSize(22).fillColor('green').text(courseTitle, { align: 'center' });
      doc.fillColor('black').moveDown(2);

      doc.fontSize(16).text(`Completion Date: ${completionDate}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).text('Unstop LMS', { align: 'center' });

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
