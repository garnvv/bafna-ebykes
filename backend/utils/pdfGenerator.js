const PDFDocument = require('pdfkit');

/**
 * Generate a Service Invoice PDF and return it as a buffer
 * @param {Object} service - Service object with User and Vehicle/Bike associations
 * @returns {Promise<Buffer>}
 */
const generateServiceInvoiceBuffer = (service) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // Header & Branding
      doc.fillColor('#10b981').fontSize(30).text('BAFNA E-BYKES', 50, 50, { align: 'left' });
      doc.fillColor('#1d1d1f').fontSize(10).text('INTELLIGENT E-MOBILITY', 50, 85);
      doc.fontSize(20).text('SERVICE INVOICE', 350, 55, { align: 'right' });

      doc.moveDown(2);
      doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

      // Customer Info
      doc.fontSize(10).fillColor('#666666').text('BILL TO:', 50, 130);
      doc.fillColor('#1d1d1f').fontSize(12).font('Helvetica-Bold').text(service.User.name, 50, 145);
      doc.font('Helvetica').fontSize(10).text(service.User.phone, 50, 160);
      doc.text(service.User.email, 50, 175);

      // Invoice Info
      doc.fillColor('#666666').text('INVOICE NO:', 350, 130);
      doc.fillColor('#1d1d1f').font('Helvetica-Bold').text(`#SRV-${service.id}`, 450, 130, { align: 'right' });
      doc.font('Helvetica').fillColor('#666666').text('DATE:', 350, 145);
      doc.fillColor('#1d1d1f').text(service.appointmentDate, 450, 145, { align: 'right' });

      doc.moveDown(3);

      // Vehicle Info Box
      doc.rect(50, 210, 500, 80).fill('#f8f8fa').stroke('#eeeeee');
      doc.fillColor('#1d1d1f').fontSize(10).font('Helvetica-Bold').text('VEHICLE DETAILS', 65, 225);
      doc.font('Helvetica').text(`Model: ${service.Vehicle?.Bike?.modelName || '—'}`, 65, 245);
      doc.text(`Reg ID: ${service.Vehicle?.vehicleRegId || '—'}`, 250, 245);
      doc.text(`VIN: ${service.Vehicle?.vin || '—'}`, 65, 260);

      doc.moveDown(4);

      // Table Header
      const tableTop = 320;
      doc.fillColor('#1d1d1f').font('Helvetica-Bold').text('DESCRIPTION', 50, tableTop);
      doc.text('QTY', 300, tableTop, { width: 50, align: 'center' });
      doc.text('PRICE', 380, tableTop, { width: 70, align: 'right' });
      doc.text('TOTAL', 480, tableTop, { width: 70, align: 'right' });
      doc.strokeColor('#1d1d1f').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Content
      let bodyTop = tableTop + 30;
      const items = service.items && service.items.length > 0 ? service.items : [
        { name: `Service Charge (${service.serviceType.toUpperCase()})`, quantity: 1, price: service.cost }
      ];

      items.forEach((item, index) => {
        const itemTotal = Number(item.price) * Number(item.quantity || 1);
        doc.font('Helvetica').fontSize(10).text(item.name, 50, bodyTop, { width: 240 });
        doc.text((item.quantity || 1).toString(), 300, bodyTop, { width: 50, align: 'center' });
        doc.text(`₹${Number(item.price).toFixed(2)}`, 380, bodyTop, { width: 70, align: 'right' });
        doc.font('Helvetica-Bold').text(`₹${itemTotal.toFixed(2)}`, 480, bodyTop, { width: 70, align: 'right' });
        
        bodyTop += 25;
        
        if (bodyTop > 700) {
          doc.addPage();
          bodyTop = 50;
        }
      });

      doc.moveDown(2);

      // Summary
      const summaryTop = bodyTop + 20;
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(350, summaryTop).lineTo(550, summaryTop).stroke();
      doc.fontSize(12).font('Helvetica-Bold').text('TOTAL PAYABLE:', 350, summaryTop + 15);
      doc.fontSize(16).fillColor('#10b981').text(`₹${Number(service.cost).toFixed(2)}`, 450, summaryTop + 13, { align: 'right' });

      // Footer
      doc.fontSize(8).fillColor('#999999').text('This is a computer-generated invoice. No signature required.', 50, 700, { align: 'center' });
      doc.text('Thank you for choosing BAFNA E-BYKES — The Future of Mobility.', 50, 715, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const fs = require('fs');
const path = require('path');

/**
 * Generate invoice PDF, save to disk, and return public URL.
 * @param {Object} service - Service object
 * @returns {Promise<{ filePath: string, publicUrl: string, filename: string }>}
 */
const generateAndSaveInvoice = async (service) => {
  const buffer = await generateServiceInvoiceBuffer(service);
  // Predictable filename so frontend can construct the URL from service.id
  const filename = `Invoice_SRV-${service.id}.pdf`;
  const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filePath = path.join(invoicesDir, filename);
  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.API_BASE_URL || 'https://bafna-ebykes.onrender.com';
  const publicUrl = `${baseUrl}/uploads/invoices/${filename}`;

  return { filePath, publicUrl, filename, buffer };
};

module.exports = { generateServiceInvoiceBuffer, generateAndSaveInvoice };
